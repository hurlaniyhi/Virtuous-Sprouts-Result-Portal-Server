const express = require("express")
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Customer = mongoose.model('Customer')
const requireAuth = require('../middlewares/requireAuth')


const router = express.Router()


router.post("/signup", async(req,res) => {
   
    req.body.username = req.body.username.replace(/ /g, "")
    req.body.username = req.body.username.toLowerCase()
    
    
    const {username, password, customerID} = req.body  

    if (!username || !password || !customerID){ 
        return  res.send({message: "You must provide all information"})
      }
   
    try{
        console.log(username, password, customerID)
    const customer = new Customer({
        username: username,
        password: password, 
        customerID,
        counter: 1
    })
      
    await customer.save()
    console.log("created  ", customer)


    const token = jwt.sign({userId: customer._id}, "MY_SECRET_KEY", {expiresIn: '10m'})

    res.send({token: token, message: "success", customerID: customer.customerID, username: customer.username, counter: customer.counter})

     } catch (err){
       console.log(err)
        return res.send({message: "user already exist"})  

}
})

router.post('/signin', async(req, res) => {
    req.body.username = req.body.username.replace(/ /g, "")
    req.body.username = req.body.username.toLowerCase()
    const {username, password} = req.body
    console.log(req.body)
    
    
    
    if (!username || !password ){ 
      return  res.send({message: "You must provide username and password"})
    }
    
   const customer = await Customer.findOne({username: username})
    

    if(!customer){
        return res.send({message: "Invalid password or username"})
    }
    else{
        try{
           await customer.comparePassword(password)
           const token = jwt.sign({userId: customer._id}, "MY_SECRET_KEY", {expiresIn: '10m'})  //expiresIn: "6s" or "6d" or "6h"
           
           await Customer.findByIdAndUpdate({_id: customer._id}, {
            _id: customer._id,
            username: customer.username,
            password: customer.password,
            customerID: customer.customerID,
            counter: customer.counter + 1 
            
        }, 
        {new: true}, (err,doc)=>{
    
        if (!err){

        console.log("successfully updated")
        console.log("welcome to your account")
        
        res.send({token: token, message: "success", customerID: customer.customerID, username: customer.username, counter: doc.counter})
            
        }
       else{
        console.log("error occured during update")
        res.send("error occured")
        }
       })
           
           
        }
        catch(err){ 
            return res.send({message: "Invalid Password or Username"})
        }
    }
})


router.post('/verifyToken', (req,res)=>{

    jwt.verify(req.body.token, "MY_SECRET_KEY", async(err, payload) => {
        if(err){
            console.log("token expired")
            return res.send("expired")
        }
        else{
            console.log("token is valid")
            return res.send("valid")  
        }
    }) 
})  

 
module.exports = router