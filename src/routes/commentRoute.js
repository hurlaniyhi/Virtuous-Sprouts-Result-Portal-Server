const express = require("express");
const mongoose = require("mongoose");
const Comment = mongoose.model("Comment");
const nodemailer = require('nodemailer')

const router = express.Router();


router.post('/addComment', async(req,res) => {
    const {comment, user} = req.body

    const comments = new Comment({
        user,
        comment
      });
    try {
        await comments.save((err, document)=>{
            if(!err){

                res.send({message: "success", info: document})
            }
            else {
                res.send({message: "something went wrong when posting comment"})
            }
        })
    }
    catch(err){
        res.send({message: "No Network Connection"})
    }
})

router.get('/fetchComments', async(req,res) => {

    const document = await Comment.find({})

    try{
        if(document){
            res.send({message: "success", info: document.reverse()})
        }
        else{
            res.send({message: "No comment could be found"})
        }
    }
    catch(err){
        res.send({message: "No Network Connection"})
    }
})


router.delete("/delComment", async (req, res) => {
  const del = await Comment.deleteOne({user: "Newton"}, (err, doc) => {
    if (!err) {
      return res.send("success");
    }
  });
});




router.post("/mailMe", async(req,res)=>{

    req.body.email = req.body.email.replace(/ /g, "")

    const {sender, email, subject, content} = req.body

    try {
       
        let transporter = nodemailer.createTransport({
          
         host: "smtp.gmail.com",
         port: 465,
         secure: true,
          auth: {
            user: 'gtfintech@gmail.com',
            pass: 'rncvncbwdrixbscw'
          },
   
        });
      
        let mailOptions = {
          from: `"${sender}" <${email}>`, 
          to: "olaniyi.jibola152@gmail.com", 
          subject: subject, 
          html: `<div>
          <h4>Sender Email: ${email}</h4>
          <p>${content}</p>
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
    }
    catch(err){
        res.send({message: "something went wrong"})
    }
   
})


module.exports = router;