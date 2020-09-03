const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Customer = mongoose.model("Customer");
const requireAuth = require("../middlewares/requireAuth");
const axios = require('axios')
//var request = require('request')
const JsEncrypt = require('node-jsencrypt')
const encrypt = new JsEncrypt()

const Cryptr = require('cryptr');
const cryptr = new Cryptr('F1nt3ch@456');

const router = express.Router();



function makeid() {
  var resletter = '';
  var resNum = '';
  var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var number = '0123456789';
  var numberLength = number.length;
  var lettersLength = letters.length;
  for (var i = 0; i < 2; i++) {
    resletter += letters.charAt(Math.floor(Math.random() * lettersLength));
  }
  for (var i = 0; i < 20; i++) {
    resNum += number.charAt(Math.floor(Math.random() * numberLength));
  }
  return resletter + resNum;
}


function encryptMe(data){
  let key = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC6YUz0ZI18Q+8EXsrQ6WlxmsnnjD0bdymm2vtRDCWW0uPmcTgG0o8CnLiVmEO0HLaBO/ZSDbtEC6OJw8+wKvWnLMUZfzqeM/XGqzeB9ZO1QZuItKVb1XhjVQ9vPxJYKPyUjDHB6Kc8a9wrrj31R4RNbHC6Ydxf2pLErmm5WGfE1QIDAQAB"

  encrypt.setPublicKey(key)
  var encrypted = encrypt.encrypt(data)
  return encrypted
}

function encryptor(data){
  var encryptedWithCryptr = cryptr.encrypt(data)
  return encryptedWithCryptr
}

function decryptor(data){
  var decryptedWithCryptr = cryptr.decrypt(data);
  return decryptedWithCryptr
}

function tokenGenerator(id){
  const token = jwt.sign({ userId: id }, "F1NT3CH@456",
  //{expiresIn: "10m"}  //expiresIn: "6s" or "6d" or "6h"
    );
  return token
}


router.post("/login", async (req, res) => {
  req.body.customerID = req.body.customerID.replace(/ /g, "");
  req.body.customerID = req.body.customerID.toLowerCase();

  var { password, customerID } = req.body;

  if (!password || !customerID) {
    return res.send({ message: "You must provide all information" });
  }
  

  var requestId = makeid()
  var deviceId = 'Linux-Box'
  var customer_ID = encryptMe(customerID)
  var pass_word = encryptMe(password)
  requestId = encryptMe(requestId)
  deviceId = encryptMe(deviceId)


  const data = {
    Password: pass_word,
    RequestId: requestId,
    Channel: 'TP-APICONNECT',
    UserId: customer_ID,
    CustomerId: customer_ID,
    SessionId: requestId,
    DeviceId: deviceId,
  };

  try{
 
  axios.post("https://ibank.gtbank.com/GTWorld2/GTBAuthenticationService/Api/NoDevLoginGTWorld", data).then( async(response) => {
     
  if(response.data.responseCode !== '00'){
    
         return res.send({
            message: "failure",
          })
          
    }else{

      
      const user = await Customer.findOne({ userId: response.data.userDetails.userId });

      if(!user){

        const data2 = {  
          customerID: encryptMe(customerID),
          requestId: requestId,
          category: 0,
          channel: "TP-APICONNECT",
          userId: encryptMe(response.data.userDetails.userId),
          customerNumber: encryptMe(response.data.userDetails.userId),
          sessionId: requestId
        }

        axios.post("https://collection.gtbank.com/AppServices/GTBCustomerService/Api/BalanceEnquiry", data2).then( async(response2) => {

       
        var accountInfo =  []
          
          for (let check of response2.data.custDetails){
            accountInfo.push({
              accountNumber: check.nubanNumber,
              accountType: check.accountType
            })
          }
         

          const customer = new Customer({
            fullName: response.data.userDetails.userFullName,
            BVN: encryptor(response.data.userDetails.userBVN),
            userId: response.data.userDetails.userId,
            customerID: customerID,
            password: encryptor(password),
            accountLength: response2.data.custDetails.length,
            accountInfo
            
          });
          await customer.save((err, document)=>{
            if(!err){
             
              const userToken = tokenGenerator(document._id)
  
              res.send({
                message: "success",
                userId: document.userId,
                fullname: document.fullName,
                customerId: document.customerID,
                token: userToken,
                num_account: document.accountLength,
                accountInfo: document.accountInfo,
                
              })
            }
            else{
              res.send({
                message: "Error occured while saving information",
                error: err
              })
            }
          });

        }).catch((err)=>{
          console.log(err)
          return res.send(err)
        })


      }
      else{
        const userToken = tokenGenerator(user._id)
          
          res.send({
            message: "success",
            userId: user.userId,
            fullname: user.username,
            customerId: user.customerID,
            token: userToken,
            num_account: user.accountLength,
            accountInfo: user.accountInfo
          })
      }
    }

  }).catch((err) => {
     console.log(err)
     return res.send(err)
      
  })

}
catch(err){
  res.send(err)
}
  
  
});



// router.post("/counter", async (req, res) => {
//   const { customerID } = req.body;
//   if (!customerID) {
//     return res.send("you must provide username");
//   }

//   const customer = await Customer.findOne({ customerID: customerID });
//   if (!customer) {
//     return res.send("Invalid username");
//   } else {
//     await Customer.findByIdAndUpdate(
//       { _id: customer._id },
//       {
//         _id: customer._id,
//         password: customer.password,
//         customerID: customer.customerID,
//         counter: customer.counter + 1,
//       },
//       { new: true },
//       (err, doc) => {
//         if (!err) {
//           console.log("successfully updated");

//           res.send({
//             message: "success",
//             customerID: customer.customerID,
//             counter: doc.counter,
//           });
//         } else {
//           console.log("error occured during update");
//           res.send("error occured");
//         }
//       }
//     );
//   }
// });


// router.delete("/delusers", async (req, res) => {
//   const del = await Customer.deleteMany({}, (err, doc) => {
//     if (!err) {
//       return res.send("success");
//     }
//   });
// });



    // var clientServerOptions = {
    //     uri: 'http://localhost:8000/ridwan',
    //     body: JSON.stringify({msg: "good"}),
    //     method: 'GET',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     }
    // }

    // router.post("/test", (req,res) =>{
    //     request(clientServerOptions, function (error, response, body) {
    //         res.send(body)
    //     });
    // })
   



  

module.exports = router;
