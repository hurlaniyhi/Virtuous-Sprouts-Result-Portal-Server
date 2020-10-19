const express = require("express");
const mongoose = require("mongoose");
const Comment = mongoose.model("Comment");

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

module.exports = router;