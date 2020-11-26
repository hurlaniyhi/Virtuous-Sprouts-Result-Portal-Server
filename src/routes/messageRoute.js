const {passwordGenerator, capitalizer, spaceRemover} = require('../functions/allFunctions')
const express = require("express");
const mongoose = require("mongoose");
const Staff = mongoose.model("Staff");
const requireAuth = require("../middlewares/requireAuth");
const {secretKey, emailUser, emailPass} = require('../config')
const nodemailer = require('nodemailer')

const router = express.Router();
router.use(requireAuth)



router.post('/directMail', async(req,res) => {
    const {subject, content, userType} = req.body


    if(userType === "Admin"){
        const allStaff = await Staff.find({})
        var bucket = []

        for (let pick of allStaff){
            bucket.push(pick.email)
        }

        var receiver = bucket
        var sender = `"Check D'Deck Homes Admin" <fintech.request@gmail.com>`
    }
    else if(userType === "Staff"){
        var receiver = "fintech.request@gmail.com"
        var sender = `${req.staff.firstName} ${req.staff.lastName} <${req.staff.email}>`
    }

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
         from: sender, 
         to: receiver, 
         subject: subject, 
         html: `<div>
                    <p>${content}</p>
                </div>`
        };
     
       transporter.sendMail(mailOptions, (error,info)=>{
           
            if(error){
                console.log("could not send message")
                return res.send({message: "Error occur while sending message"})
            } 
            else{ 
                console.log("Message sent: %s", info.messageId);
                return res.send({message: "success"})
            } 
        })
})


router.post('/personalMail', async(req,res) => {
    const {receiverName, subject, content, userType} = req.body
    
    var username = receiverName.replace(/ /g, ".")
    username = username.toLowerCase()
    console.log(username)

   
    const staff = await Staff.findOne({username: username})
    
    if(!staff){
        return res.send({message: "Receiver name is incorrect"})
    }

    if(userType === "Admin"){
        var sender = `"Check D'Deck Homes Admin" <fintech.request@gmail.com>`
    }
    else if(userType === "Staff"){
        var sender = `${req.staff.firstName} ${req.staff.lastName} <${req.staff.email}>`
    }

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
         from: sender, 
         to: staff.email, 
         subject: subject, 
         html: `<div>
                    <p>${content}</p>
                </div>`
        };
     
       transporter.sendMail(mailOptions, (error,info)=>{
           
            if(error){
                console.log("could not send message")
                return res.send({message: "Error occur while sending message"})
            } 
            else{ 
                console.log("Message sent: %s", info.messageId);
                return res.send({message: "success"})
            } 
        })
})



module.exports = router;
