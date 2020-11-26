const express = require("express");
const mongoose = require("mongoose");
const Staff = mongoose.model("Staff");
const requireAuth = require("../middlewares/requireAuth");
const {cloudName, apiKey, apiSecret} = require('../config')
const crypto = require("crypto")
const multer = require('multer')
const path = require('path')
const cloudinary = require('cloudinary').v2


const router = express.Router();
router.use(requireAuth)



router.post('/dp', async(req,res) => {
    console.log("entered")
    storage = multer.diskStorage({
        destination: function(req, file, cb){
            cb(null, 'uploads/')
        },
        filename: function(req, file, cb){
            console.log(file)
            cb(null, file.originalname)
        }
    })   
    
    const upload = multer({storage}).single('picture')
    upload(req, res, function(err){
        if(err){
            return res.send(err)
        }
        console.log("file uploaded to server")
        console.log(req.file)
        
        cloudinary.config({
            cloud_name: "dcx4utzdx",
            api_key: "226791946435464",
            api_secret: "yzsp3pOrvIEzFAhfMfWEIWXQmmA"
        })
        console.log("welcome to cloudinary")
        const path = req.file.path
        
        const uniqueFilename = new Date().toISOString()

        cloudinary.uploader.upload(
            path,
            {
                public_id: `blog/${uniqueFilename}`, tags: `blog`
            },
            async function(err, image){
                if(err){ 
                    console.log(err)
                    return res.send({message: "Error occured during upload"})
                }
                console.log("file uploaded to cloudinary")

                const fs = require('fs')
                fs.unlinkSync(path)
                //console.log(image)
                //localsave.passport = image.secure_url


                await Staff.findByIdAndUpdate({_id: req.staff._id}, 
                    
                    {$set: {profilePicture: image.secure_url}},
                    { new: true },
                     (err,doc)=>{
                
                    if (!err){
                        console.log({message:"successfully updated", profile: doc})
                        res.send({message: "success", profile: doc})
                    }
                    else{
                        console.log("Error occured during upload")
                        res.send({message: "Error occured during upload"})
                    }
                })
            }
        )

    })
})


module.exports = router;