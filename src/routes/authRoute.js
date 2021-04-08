const {passwordGenerator, capitalizer, spaceRemover} = require('../functions/allFunctions')
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Associate = mongoose.model("Associate");
const requireAuth = require("../middlewares/requireAuth");
const axios = require('axios')
const {secretKey, emailUser, emailPass} = require('../config')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')

const router = express.Router();



router.post("/addMember", async(req,res) => {

    if(!req.body.firstName || !req.body.surname || !req.body.email || !req.body.address || !req.body.phoneNumber
        || !req.body.memberClass || !req.body.memberType || !req.body.gender){
            return res.send({responseCode: "400", message: "Kindly provide all required information"})
        }

    req.body.firstName = capitalizer(req.body.firstName)
    req.body.firstName = spaceRemover(req.body.firstName)
    req.body.surname = capitalizer(req.body.surname)
    req.body.surname = spaceRemover(req.body.surname)
    req.body.email = spaceRemover(req.body.email)

    if(req.body.middleName){
        req.body.middleName = spaceRemover(req.body.firstName)
        req.body.middleName = capitalizer(req.body.lastName)
    }

    const {
        firstName, middleName, surname,
        email, memberType,
        phoneNumber, address, 
        memberClass, gender, 
    } = req.body

    var username = `${firstName}.${surname}`
    username = username.toLowerCase()

    //var password = passwordGenerator()

    try{

        const members = await Associate.find({})

        let regId = String(members.length + 1)
        let regForVerification = regId
        let pref = `${firstName.substring(0,3).toUpperCase()}/${surname.substring(0,3).toUpperCase()}`
        if(regId.length === 1){
            regId = `${pref}/00${regId}`
        }
        else if(regId.length === 2){
            regId = `${pref}/0${regId}`
        }
        else{
            regId = `${pref}/${regId}`
        }

        var password = regId

        for(let check of members){
            if(check.username === username){
                username = username + regForVerification
            }
        }

        regDate = `${new Date().getDate()}/${new Date().getMonth()+1}/${new Date().getFullYear()}`

        const member = new Associate({
            firstName,
            surname,
            middleName,
            email,
            password,
            address,
            memberType,
            passRecovery: password,
            phoneNumber,
            regId,
            memberClass,
            gender,
            username,
            regDate
        })
          
        await member.save()
        console.log({msg: "Member has been added", info: member})

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
             from: `"Virtuous Sprouts Academy" <olaniyi.jibola152@gmail.com>`, 
             to: email, 
             subject: "Login Details", 
             html: `<div>
                        <p>Assalaam Alaikum,</p>
                        <h4>Kindly use the below details to login to the school/student portal app.</h4>
                        <p>username: ${username}, password: ${password}</p>
                    </div>`
           
           };
         
           transporter.sendMail(mailOptions, (error,info)=>{
               
             if(error){
                 return console.log(error)
             } 
       
            else{ 
                console.log("Message sent: %s", info.messageId);
               
                return res.send({responseCode: "00", message: "success"})
             }
           
           })
        //res.send({message: "success"})
    }
    catch(err){
        console.log(err)
        return res.send({responseCode: "01", message: "Could not add member, try again later", error: err})
    }

})

router.post("/login", async(req,res) => {

    if(!req.body.username || !req.body.password){
        return res.send({responseCode: "400", message: "Kindly provided all required information"})
    }

    req.body.username = spaceRemover(req.body.username)
    req.body.username = req.body.username.toLowerCase()

    const {username, password} = req.body

    const member = await Associate.findOne({username: username})

    if(!member){
        return res.send({responseCode: "01", message: "Invalid username or password"})
    }
    else{
        
        try{
            await member.comparePassword(password)
            const token = jwt.sign({memberId: member._id}, secretKey)
            console.log("welcome to your account") 
            return res.send({responseCode: "00", message: "success", token: token, profile: member})
        }           
            catch(err){
            return res.send({responseCode: "01", message: "Invalid username or password"})   
        }  
        
    }
})

router.post("/changePassword", requireAuth, async(req,res) => {

    const member = await Associate.findOne({username: req.member.username})
    if(!member){
        return({responseCode: "01", message: "User is not found"})
    }
       try{
            bcrypt.genSalt(10, (err, salt) => {
                
                bcrypt.hash(req.body.password, salt, async(err, hash)=>{
                    console.log(hash)
                    
                    const newpassword = hash
                    

                    await Associate.findByIdAndUpdate({_id: member._id}, {
                        
                    $set: {
                        password: newpassword,
                        passRecovery: req.body.password
                    }
                        
                    }, (err,doc)=>{
                
                    if (!err){
                        console.log({message:"successfully updated", member: doc})
                        res.send({responseCode: "00", message: "success"})
                    }
                    else{
                        console.log("error occured during update")
                        res.send({responseCode: "01", message: "error occured while changing password"})
                    }
                })
                
                })
            })
       }
       catch(err){
           res.send({responseCode: "101", message: "Something went wrong", error: err})
       }
       
})



router.post("/member", async(req,res) => {
    req.body.username = req.body.username.toLowerCase()
    const {username, regId} = req.body
    
    
    try{
        if(username && regId){
            const member = await Associate.findOne({username, regId})
            if(member){
                return res.send({responseCode: "00", message: "success", info: member})
            }
            else{
                return res.send({responseCode: "01", message: "Member did not exist"})
            }
        }
        else{
            return res.send({responseCode: "01", message: "kindly provide required field"})
        }
       
    }
    catch(err){
        return res.send({responseCode: "101", message: "Something went wrong"})
    }
})



router.post("/fetchMembers", async(req,res) => {
    const {memberClass} = req.body
   
    try{
        const allMembers = await Associate.find({memberClass})
        
        if(allMembers){
            return res.send({responseCode: "00", message: "success", info: allMembers})
        }
        else{
            return res.send({responseCode: "01", message: "This class currently did not have any member"})
        }
        
    }
    catch(err){
        res.send({responseCode: "101", message: "Something went wrong", error: err})
    }  
}) 


router.post("/updateMember", async(req,res) => {

    if(!req.body.firstName || !req.body.surname || !req.body.email || !req.body.address || !req.body.phoneNumber
        || !req.body.memberClass || !req.body.memberType || !req.body.gender){
            return res.send({responseCode: "400", message: "Kindly provide all required information"})
        }

    req.body.firstName = capitalizer(req.body.firstName)
    req.body.firstName = spaceRemover(req.body.firstName)
    req.body.surname = capitalizer(req.body.surname)
    req.body.surname = spaceRemover(req.body.surname)
    req.body.email = spaceRemover(req.body.email)

    if(req.body.middleName){
        req.body.middleName = spaceRemover(req.body.firstName)
        req.body.middleName = capitalizer(req.body.lastName)
    }
    if(!req.body.id){
        return res.send({responseCode: "01", message: "Kindly provide all required field"})
    }

    const {
        firstName, middleName, surname,
        email, memberType,
        phoneNumber, address, 
        memberClass, gender, id
    } = req.body

    var username = `${firstName}.${surname}`
    username = username.toLowerCase()

    try{
        var check = await Associate.findOne({_id: id})
        if(!check){
            return res.send({responseCode: "01", message: "The member's profile you want to update did not exist"})
        }
        
        await Associate.findByIdAndUpdate({_id: id}, {
                        
            $set: {
                firstName,
                middleName,
                surname,
                username,
                email,
                memberType,
                memberClass,
                phoneNumber,
                address,
                gender
            }
                
            }, {new: true}, (err,doc)=>{
        
            if (!err){
                console.log({responseCode: "00", message:"successfully updated", member: doc})
                res.send({responseCode: "00", message: "successfully updated", info: doc})
            }
            else{
                console.log("error occured during update")
                res.send({responseCode: "01", message: "error occured while updating information"})
            }
        })
    }
    catch(err){
        res.send({responseCode: "01", message: "Soemthing went wrong", error: err})
    }

})


router.post("/deleteMember", async(req,res) => {

    try{
        await Associate.findByIdAndDelete({_id: req.body.id}, (err, msg) =>{
            if(!err){
                return res.send({responseCode: "00", message: "success", info: "Member data has been successfully deleted"})
            }
            else{
                return res.send({responseCode: "01", message: "Error occur while deleting member data"})
            }
        })
    }
    catch(err){
        return res.send({responseCode: "101", message: "Something went wrong"})
    }
})

module.exports = router;