const express = require("express");
const mongoose = require("mongoose");
const Associate = mongoose.model("Associate");
const requireAuth = require("../middlewares/requireAuth");
const { emailUser, emailPass, newcoreEmail, newcoreEmailPass } = require('../config')
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

router.post("/newcoretechnology-mail", async(req, res)=>{
    const {name, emailAddress, phoneNumber, mailSubject, mailContent} = req.body

    var sender = `Our Client <${emailAddress}>`

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com", 
        port: 465,
        secure: true,
        auth: {
            user: newcoreEmail,
            pass: newcoreEmailPass
        },
    });

    try{
        let mailOptions = {
            from: sender, 
            to: "newcoretechnologies@gmail.com", 
            subject: mailSubject, 
            html: `<div>
                    <p>${mailContent}</p><br>
                    <p><strong>Sender Name</strong>: ${name}</p>
                    <p><strong>Sender Email</strong>: ${emailAddress}</p>
                    <p><strong>Sender No</strong>: ${phoneNumber}</p>
                </div>`
        };
    
        transporter.sendMail(mailOptions, (error,info)=>{
            
            if(error){
                console.log(error)
                return res.send({responseCode: "01", message: "Error occur while sending message"})
            } 
            else{ 
                console.log("Message sent: %s", info.messageId);
                return res.send({responseCode: "00", message: "Email successfully sent"})
            } 
        })
    }
    catch(err){
        console.log({error: err.message});
        return res.send({responseCode: "99", message: `Something went wrong - ${err.message}`})

    }
})

module.exports = router;
