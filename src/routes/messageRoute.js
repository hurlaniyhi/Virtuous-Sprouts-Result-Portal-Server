const express = require("express");
const mongoose = require("mongoose");
const Associate = mongoose.model("Associate");
const requireAuth = require("../middlewares/requireAuth");
const { emailUser, emailPass } = require('../config')
const nodemailer = require('nodemailer')

const router = express.Router();
//router.use(requireAuth)



router.post('/broadcastMail', async(req,res) => {
    const {mailSubject, mailContent} = req.body

    const allMembers = await Associate.find({})
    var emailReceivers = []

    for (let pick of allMembers){
        if(pick.memberType === "Student"){
            emailReceivers.push(pick.email)
        }
    }

    var receiver = emailReceivers
    var sender = `"Virtuous Sprouts Academy" <virtuousproutsacademy@gmail.com>`

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
        subject: mailSubject, 
        html: `<div>
                <p>${mailContent}</p>
            </div>`
    };
    
    transporter.sendMail(mailOptions, (error,info)=>{
        
        if(error){
            console.log(error)
            return res.send({responseCode: "01", message: "Error occur while sending message"})
        } 
        else{ 
            console.log("Message sent: %s", info.messageId);
            return res.send({responseCode: "00", message: "Broadcast mail successfully sent"})
        } 
    })
})

module.exports = router;
