const express = require('express')
const mongoose = require('mongoose')
const nodemailer = require('nodemailer')
const crypto = require("crypto")
const multer = require('multer')
const path = require("path")
const requireAuth = require("../middlewares/requireAuth");
const {secretKey, emailUser, emailPass} = require('../config')
const {databaseKey} = require('../config')
const Test = mongoose.model("Test");
const Exam = mongoose.model("Exam");
mongoose.set('useFindAndModify', false);

const router = express.Router();
//router.use(requireAuth)

router.post("/upload-result", async(req, res)=>{
        const {studentName, studentClass, teacherName, term, session, result, resultType} = req.body
    if(!studentName || !studentClass || !teacherName || !term || 
        !session || !result || !resultType){
            return res.send({responseCode: "01", message: "Kindly provide all required information"})
        }

    try{
        if(resultType === "Test"){
            var testResult = await Test.findOne({studentName, studentClass, term, session})
            if(testResult){
                return res.send({
                    responseCode: "01", 
                    message: `You've already uploaded ${term} term test result for ${studentName} in ${session} session, consider editing?`
                })
            }
            const resultData = new Test({
                studentName,
                studentClass,
                teacherName,
                term,
                session,
                testResult: result
            })
              
            await resultData.save((err, response)=>{
                if(!err){
                    console.log({msg: "Test Result succesfully saved", info: response})
                    return res.send({responseCode: "00", message: "Test Result succesfully saved"})
                }
                else{
                    return res.send({responseCode: "01", message: "Error occured while saving test result"})
                }
            })
        }
        else if(resultType === "Exam"){
            var examResult = await Exam.findOne({studentName, studentClass, term, session})
            if(examResult){
                return res.send({
                    responseCode: "01", 
                    message: `You've already uploaded ${term} term exam result for ${studentName} in ${session} session, consider editing?`
                })
            }
            const resultData = new Exam({
                studentName,
                studentClass,
                teacherName,
                term,
                session,
                examResult: result
            })
              
            await resultData.save((err, response)=>{
                if(!err){
                    console.log({msg: "Exam Result succesfully saved", info: response})
                    return res.send({responseCode: "00", message: "Exam Result succesfully saved"})
                }
                else{
                    return res.send({responseCode: "01", message: "Error occured while saving exam result"})
                }
            })
        }
        else{
            return res.send({responseCode: "00", message: "Kindly provide the result type (Test or Exam)"})
        }
        
    }
    catch(err){
        return res.send({responseCode: "101", message: "Something went wrong", error: err})
    }
})

router.get("/get-result", async(req,res) =>{
    const {studentName, studentClass, session, term} = req.body
    
    try{
        var testResult = await Test.findOne({studentName, studentClass, term, session})
        var examResult = await Exam.findOne({studentName, studentClass, term, session})
        let resultData = []
        let subjectResult = {};

        if(!examResult && !testResult){
            return res.send({responseCode: "01", message: "The result you requested for did not exist"})
        }
        if(!examResult && testResult){
            for(let check of testResult.testResult){
                subjectResult = {
                    subject: check.subject,
                    testScore: check.score,
                    examScore: "",
                    totalScore: check.score
                }
                resultData.push(subjectResult)
            }
            return res.send({responseCode: "00", message: "Success", result: resultData})
        }
        if(examResult && !testResult){
            for(let check of examResult.examResult){
                subjectResult = {
                    subject: check.subject,
                    testScore: "",
                    examScore: check.score,
                    totalScore: check.score
                }
                resultData.push(subjectResult)
            }
            return res.send({responseCode: "00", message: "Success", result: resultData})
        }
        if(examResult && testResult){
            
            for(let check of examResult.examResult){
                let isPushed = false
                for(let compare of testResult.testResult){
                    if(check.subject === compare.subject){
                        subjectResult = {
                            subject: check.subject,
                            testScore: compare.score,
                            examScore: check.score,
                            totalScore: check.score + compare.score
                        }
                        resultData.push(subjectResult)
                        isPushed = true;
                        break;
                    }
                    else{
                        subjectResult = {
                            subject: check.subject,
                            testScore: "",
                            examScore: check.score,
                            totalScore: check.score
                        }
                    }
                }
                if(!isPushed && subjectResult){
                    resultData.push(subjectResult)
                    isPushed = false
                }
            }
            return res.send({responseCode: "00", message: "Success", result: resultData})
        }
    }
    catch(err){
        return res.send({responseCode: "101", message: "Something went wrong", error: err})
    }
    
})



module.exports = router