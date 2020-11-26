const {passwordGenerator, capitalizer, spaceRemover} = require('../functions/allFunctions')
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Staff = mongoose.model("Staff");
const requireAuth = require("../middlewares/requireAuth");
const axios = require('axios')
const {secretKey, emailUser, emailPass} = require('../config')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')

const router = express.Router();



router.post("/addUser", async(req,res) => {
    
    req.body.firstName = capitalizer(req.body.firstName)
    req.body.firstName = spaceRemover(req.body.firstName)
    req.body.lastName = capitalizer(req.body.lastName)
    req.body.lastName = spaceRemover(req.body.lastName)
    req.body.email = spaceRemover(req.body.email)

    const {
        firstName, lastName, 
        email, userType,
        phoneNumber, address, 
        jobStatus, department, 
        gender, maritalStatus,
    } = req.body

    var username = `${firstName}.${lastName}`
    username = username.toLowerCase()

    var password = passwordGenerator()

    try{
        const staff = new Staff({
            firstName,
            lastName,
            email,
            password,
            address,
            userType,
            phoneNumber,
            jobStatus,
            department,
            gender,
            maritalStatus,
            username
        })
          
        await staff.save()
        console.log({msg: "Staff has been added", info: staff})

        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
             auth: {
               user: emailUser,
               pass: emailPass
             },
      
           });
         
           let mailOptions = {
             from: `"Check D'Deck Homes" <olaniyi.jibola152@gmail.com>`, 
             to: email, 
             subject: "Login Details", 
             html: `<div>
                        <h4>Kindly use the below details to login to check d'deck homes app</h4>
                        <p>username: ${username}, password: ${password}</p>
                    </div>`
           
           };
         
           transporter.sendMail(mailOptions, (error,info)=>{
               
             if(error){
                 return console.log(error)
             } 
       
            else{ 
                console.log("Message sent: %s", info.messageId);
               
                return res.send({message: "success"})
             }
           
           })
        //res.send({message: "success"})
    }
    catch(err){
        console.log(err)
        return res.send({message: "Staff already exist", error: err})
    }

})

router.post("/login", async(req,res) => {
    //req.body.username = spaceRemover(req.body.username)
    req.body.username = req.body.username.toLowerCase()

    const {username, password, userType} = req.body

    const staff = await Staff.findOne({username: username})

    if(!staff){
        return res.send({message: "Invalid username or password"})
    }
    else{
        
        try{
            await staff.comparePassword(password)
            const token = jwt.sign({staffId: staff._id}, secretKey)
            if(staff.userType != userType){
                console.log({mesage: `This is not a/an ${userType} account`})
                return res.send({message: "type-issue", info: `This is not a/an ${userType} account`})
            }
            else{
                res.send({message: "success", token: token, profile: staff})
                console.log("welcome to your account")
            }
            
        }           
            catch(err){
            return res.send({message: "Invalid username or password"})   
        }  
        
    }
})

router.post("/changePassword", requireAuth, async(req,res) => {

    const staff = await Staff.findOne({username: req.staff.username})
    if(!staff){
        return({message: "User is not found"})
    }
       try{
            bcrypt.genSalt(10, (err, salt) => {
                
                bcrypt.hash(req.body.password, salt, async(err, hash)=>{
                    console.log(hash)
                    
                    const newpassword = hash
                    

                    await Staff.findByIdAndUpdate({_id: staff._id}, {
                        
                    $set: {password: newpassword}
                        
                    }, (err,doc)=>{
                
                    if (!err){
                        console.log({message:"successfully updated", staff: doc})
                        res.send({message: "success"})
                    }
                    else{
                        console.log("error occured during update")
                        res.send({message: "error occured"})
                    }
                })
                
                })
            })
       }
       catch(err){
           res.send({message: "Something went wrong", error: err})
       }
       
})



router.post("/user", requireAuth, async(req,res) => {
    
    try{
        if(req.body.user){
            const staff = await Staff.findOne({username: req.body.user})
            if(staff){
                return res.send({message: "success", profile: staff})
            }
            else{
                return res.send({message: "Staff did not exist"})
            }
        }
        else{
            return res.send({message: "success", profile: req.staff})
        }
       
    }
    catch(err){
        return res.send({message: "No network connection"})
    }
})



router.post("/fetchStaff", requireAuth, async(req,res) => {
    const {type} = req.body
   
    try{
        if(type === "all"){
            const allStaff = await Staff.find({})
           
            if(allStaff){
               return res.send({message: "success", info: allStaff})
            }
            else{
                return res.send({message: "No staff currently"})
            }
        }
        else{
            const allStaff = await Staff.find({department: type})

            if(allStaff){
                return res.send({message: "success", info: allStaff})
            }
            else{
                return res.send({message: "No staff currently"})
            }
        }
    }
    catch(err){
        res.send({message: "Something went wrong", error: err})
    }  
}) 


router.post("/deleteStaff", async(req,res) => {

    try{
        await Staff.findByIdAndDelete({_id: req.body.id}, (err, msg) =>{
            if(!err){
                return res.send({message: "success", info: "Staff data has been successfully deleted"})
            }
            else{
                return res.send({message: "Error occur while deleting staff data"})
            }
        })
    }
    catch(err){
        return res.send({message: "Something went wrong"})
    }
})

module.exports = router;