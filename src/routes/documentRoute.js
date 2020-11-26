const express = require('express')
const mongoose = require('mongoose')
const nodemailer = require('nodemailer')
const crypto = require("crypto")
const multer = require('multer')
const path = require("path")
const requireAuth = require("../middlewares/requireAuth");
const {secretKey, emailUser, emailPass} = require('../config')
const File = mongoose.model("File");
const GridFsStorage = require("multer-gridfs-storage")
const {databaseKey} = require('../config')

mongoose.set('useFindAndModify', false);

const router = express.Router();
//router.use(requireAuth)



var minisave = []
var docName = []

// CONNECTION
const mongoURI = databaseKey
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

let gfs;
conn.once("open", () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads"
  });
});

var storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        
        docName.push(file.originalname)
        console.log(file.originalname)
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString("hex") + path.extname(file.originalname);
                minisave.push(filename)
                console.log(minisave[minisave.length-1])
          
                const fileInfo = {
                    filename: filename,
                    bucketName: "uploads"

                };
                resolve(fileInfo);
            });
        });
    }
  });
  
const upload = multer({
    storage
});



router.post("/file", requireAuth, upload.single("document"), (req,res) => {
    uploadFile(req,res)
})

async function uploadFile(req,res){
    const {description} = req.body
    var fileName = ""
    for(let edit of docName[docName.length-1]){
        if(edit != "."){
            fileName = fileName + edit
        }
        else{
            break;
        }
    }

    try{
        const file = new File({
            staffId: req.staff._id,
            fileName,
            description,
            fileBinary: minisave[minisave.length-1],
            gfsId: req.file.id
        })
          
        await file.save()
        console.log({message: "File has been successfully uploaded", info: file})
        return res.send({message: "success", info: file})
    }
    catch(err){
        return res.send({message: "Error occur while uploading file", error: err})
    }
}


router.get("/file/:filename", (req, res) => {

    console.log(req.params.filename)

    try{
        const file = gfs
        .find({
          filename: req.params.filename
        })
        .toArray((err, files) => {
          if (!files || files.length === 0) {
            return res.send({
              message: "failed"
            });
          } 
          else{
              console.log({message: "found", file: files[0]})
              gfs.openDownloadStreamByName(req.params.filename).pipe(res);
          }
        });
    }
    catch(err){
        return res.send({message: "failed"})
    }
       
  })

  router.post('/deleteFile', requireAuth, async(req,res) => {

    try{
       await gfs.delete(new mongoose.Types.ObjectId(req.body.gfsId),
        async(err, data) => {
            if(err){
                return res.send({message: "error occured"})
            }
            else{
                await File.findByIdAndDelete({_id: req.body.fileId}, (err, msg)=>{
                    if(!err){
                        return res.send({message: "success"})
                    }
                    else{
                        return res.send({message: "Error occur while deleting the file"})
                    }
                })
            }
        })
    }
    catch(err){
        return res.send({message: "Something went wrong"})
    }
      
  })


  router.post("/fetchFiles", requireAuth, async(req,res) => {

    const {type} = req.body
    
    try{
        if(type === "all"){
            const files = await File.find({})
            if(files){
                return res.send({message: "success", info: files})
            }
            else{
                return res.send({message: "No file currently"})
            }
        }
        else{
            const files = await File.find({staffId: req.staff._id})
           
            if(files){
                return res.send({message: "success", info: files})
            }
            else{
                return res.send({message: "No file currently"})
            }
        }
        
    }
    catch(err){
        return res.send({message: "Something went wrong"})
    }  
    
  })

module.exports = router