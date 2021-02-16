// const express = require("express");
// const mongoose = require("mongoose");
// const Staff = mongoose.model("Staff");
// const requireAuth = require("../middlewares/requireAuth");
// const {cloudName, apiKey, apiSecret} = require('../config')
// const crypto = require("crypto")
// const multer = require('multer')
// const path = require('path')
// const cloudinary = require('cloudinary').v2
// const fs = require('fs-extra');


// const router = express.Router();
// router.use(requireAuth)


// const storage = multer.diskStorage({
//     destination: function(req, file, cb){
//         cb(null, 'uploads/')
//     },
//     filename: function(req, file, cb){
//         //console.log(file)
//         cb(null, file.originalname)
//     }
// })   

// router.post('/dp', async(req,res) => {

//     // Create uploads folder
//     const dir = './uploads';
//     await fs.ensureDirSync(dir);
//     // **************************

//     const upload = multer({storage}).single('picture')
//     upload(req, res, function(err){
//         if(err){
//             return res.send({message:"there is error", info: err})
//         }
//         console.log("file uploaded to server")
//         console.log(req.file)
//         try{
//             cloudinary.config({
//                 cloud_name: cloudName,
//                 api_key: apiKey,
//                 api_secret: apiSecret
//             })
//             console.log("welcome to cloudinary")
//             const path = req.file.path
            
//             const uniqueFilename = new Date().toISOString()

//             cloudinary.uploader.upload(
//                 path,
//                 {
//                     public_id: `blog/${uniqueFilename}`, tags: `blog`
//                 },
//                 async function(err, image){
//                     if(err){ 
//                         console.log(err)
//                         return res.send({message: "Error occured during upload"})
//                     }
//                     console.log("file uploaded to cloudinary")

//                     const fs = require('fs')
//                     fs.unlinkSync(path)
//                     //console.log(image)
//                     //localsave.passport = image.secure_url


//                     await Staff.findByIdAndUpdate({_id: req.staff._id}, 
                        
//                         {$set: {profilePicture: image.secure_url}},
//                         { new: true },
//                         (err,doc)=>{
                    
//                         if (!err){
//                             console.log({message:"successfully updated", profile: doc})
//                             return res.send({message: "success", profile: doc})
//                         }
//                         else{
//                             console.log("Error occured during upload")
//                             return res.send({message: "Error occured during upload"})
//                         }
//                     })
//                 }
//             )
//         }
//         catch(err){
//             console.log(err)
//             return res.send({message: "error occured", info: err})
//         }

//     })
// })


// module.exports = router;