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

router.post("/get-result", async(req,res) =>{
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
            return res.send({responseCode: "00", message: "Success", result: resultData, resultID: {testId: testResult._id}})
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
            return res.send({responseCode: "00", message: "Success", result: resultData, resultID: {examId: examResult._id}})
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
            return res.send({responseCode: "00", message: "Success", result: resultData, resultID: {testId: testResult._id, examId: examResult._id}})
        }
    }
    catch(err){
        return res.send({responseCode: "101", message: "Something went wrong", error: err})
    }
    
})


router.post("/edit-result", async(req, res) => {
    var today = new Date()
    let year = today.getFullYear()

    const {resultId, session, term, memberType, resultType, updatedResult} = req.body
    if(!resultId || !session || !term || !memberType || !resultType || !updatedResult){
        return res.send({responseCode: "01", message: "Kindly provide all required information"})
    }
    if(resultType != "Exam" && resultType != "Test"){
        return res.send({responseCode: "01", message: "Kindly provide valid result type (Exam or Test)"})
    }

    if(memberType != "Admin" && Number(session.substring(session.indexOf("/")+1, session.length)) < year){
       return res.send({responseCode: "01", message: "Only admin is authorised to edit this result"})
    }

    try{
        if(resultType === "Test"){
            var check = await Test.findOne({_id: resultId})
            if(!check){
                return res.send({responseCode: "01", message: "The result you are trying to update did not have test result"})
            }

            await Test.findByIdAndUpdate({_id: resultId}, {
                            
                $set: {
                    term,
                    session,
                    testResult: updatedResult
                }
                    
                }, {new: true}, (err,doc)=>{
            
                if (!err){
                    console.log({message:"successfully updated"})
                    return res.send({responseCode: "00", message: "successfully updated", updatedResult: doc})
                }
                else{
                    console.log("error occured during update")
                    return res.send({responseCode: "01", message: "error occured while updating result"})
                }
            })
        }
        else if(resultType === "Exam"){
           var check = await Exam.findOne({_id: resultId})
            if(!check){
                return res.send({responseCode: "01", message: "The result you are trying to update did not have exam result"})
            }
            await Exam.findByIdAndUpdate({_id: resultId}, {
                            
                $set: {
                    term,
                    session,
                    examResult: updatedResult
                }
                    
                }, {new: true}, (err,doc)=>{
            
                if (!err){
                    console.log({message:"successfully updated"})
                    return res.send({responseCode: "00", message: "successfully updated", updatedResult: doc})
                }
                else{
                    console.log("error occured during update")
                    return res.send({responseCode: "01", message: "error occured while updating result"})
                }
            })
        }
    }
    catch(err){
        return res.send({responseCode: "101", message: "Something went wrong", error: err})
    }
     
})


router.post("/delete-result", async(req, res) => {
    const {studentName, studentClass, session, term} = req.body
    if(!(studentName || studentClass || session || term)){
        return res.send({responseCode: "01", message: "Kindly provide all required information"})
    }

    try{
        var checkTest = await Test.findOne({studentName, studentClass, term, session})
        var checkExam = await Exam.findOne({studentName, studentClass, term, session})

        if(!checkExam && !checkTest){
            return res.send({responseCode: "01", message: "The result you want to delete did not exist"})
        }

        let verifiedExam = false
        let verifiedTest = false

        if(checkExam){
            await Exam.findOneAndDelete({studentName, studentClass, term, session}, 
                (err, docs) => {
                    if(!err){
                        verifiedExam = true
                    }
                    else{
                        verifiedExam = false
                    }
                }
            )
        }
        if(checkTest){
           await Test.findOneAndDelete({studentName, studentClass, term, session}, 
                (err, docs) => {
                    if(!err){
                        verifiedTest = true
                    }
                    else{
                        verifiedTest = false
                    }
                }
            )
        }

        if(checkExam && checkTest){
            if(verifiedExam && verifiedTest){
                return res.send({responseCode: "00", message: "Result successfully deleted"})
            }
            else{
                return res.send({responseCode: "01", message: "Error occur while deleting resulting"})
            }
        }
        else if(checkExam){
            if(verifiedExam){
                return res.send({responseCode: "00", message: "Result successfully deleted"})
            }
            else{
                return res.send({responseCode: "02", message: "Error occur while deleting resulting"})
            }
        }
        else if(checkTest){
            if(verifiedTest){
                return res.send({responseCode: "00", message: "Result successfully deleted"})
            }
            else{
                return res.send({responseCode: "03", message: "Error occur while deleting resulting"})
            }
        }
    }
    catch(err){
        return res.send({responseCode: "01", message: "Something went wrong", error: err})
    }
     
})


module.exports = router