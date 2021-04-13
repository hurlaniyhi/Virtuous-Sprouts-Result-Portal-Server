const express = require('express')
const mongoose = require('mongoose')
const nodemailer = require('nodemailer')
const crypto = require("crypto")
const multer = require('multer')
//const path = require("path")
//const requireAuth = require("../middlewares/requireAuth");
const {cocantenateTestAndExam} = require('../functions/allFunctions')
const {secretKey, emailUser, emailPass} = require('../config')
const Test = mongoose.model("Test");
const Exam = mongoose.model("Exam");
mongoose.set('useFindAndModify', false);

const router = express.Router();
//router.use(requireAuth)

router.post("/upload-result", async(req, res)=>{
        const {studentName, studentClass, teacherName, term, session, result, resultType, teacherComment} = req.body
    if(!studentName || !studentClass || !teacherName || !term || 
        !session || !result || !resultType){
            return res.send({responseCode: "01", message: "Kindly provide all required information"})
        }

    try{
        if(resultType === "Test"){
            var testResult = await Test.findOne({studentName, term, session}) // studentClass
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
                teacherComment,
                adminComment: "",
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
            var examResult = await Exam.findOne({studentName, term, session}) // studentClass
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
                teacherComment,
                adminComment: "",
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
        console.log(err)
        return res.send({responseCode: "101", message: "Something went wrong", error: err})
    }
})

router.post("/get-result", async(req,res) =>{
    const {studentName, studentClass, session, term} = req.body
    
    try{
        var testResult = await Test.findOne({studentName, term, session}) // studentClass
        var examResult = await Exam.findOne({studentName, term, session}) // studentClass
        let resultData = []
        let subjectResult = {};
        let adminRemark = examResult.adminComment
        if(!adminRemark){
            adminRemark = testResult.adminComment
        }

        if(!examResult && !testResult){
            return res.send({responseCode: "01", message: "The result you requested for did not exist"})
        }
        if(!examResult && testResult){
            for(let check of testResult.testResult){
                subjectResult = {
                    subject: check.subject,
                    testScore: check.score,
                    examScore: "-",
                    totalScore: check.score
                }
                resultData.push(subjectResult)
            }
            return res.send({
                responseCode: "00", message: "Success", 
                result: resultData, resultID: {testId: testResult._id},
                teacherComment: testResult.teacherComment,
                adminComment: adminRemark
            })
        }
        if(examResult && !testResult){
            for(let check of examResult.examResult){
                subjectResult = {
                    subject: check.subject,
                    testScore: "-",
                    examScore: check.score,
                    totalScore: check.score
                }
                resultData.push(subjectResult)
            }
            return res.send({
                responseCode: "00", message: "Success", 
                result: resultData, resultID: {examId: examResult._id},
                teacherComment: examResult.teacherComment,
                adminComment: adminRemark
            })
        }
        if(examResult && testResult){
            let combinedResult = cocantenateTestAndExam(examResult.examResult, testResult.testResult)
            return res.send({
                responseCode: "00", message: "Success", result: combinedResult, 
                resultID: {testId: testResult._id, examId: examResult._id},
                teacherComment: examResult.teacherComment,
                adminComment: adminRemark
            })
        }
    }
    catch(err){
        console.log(err)
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
    if(!studentName || !studentClass || !session || !term){
        return res.send({responseCode: "01", message: "Kindly provide all required information"})
    }

    try{
        console.log(req.body)
        var checkTest = await Test.findOne({studentName, term, session}) // studentClass
        var checkExam = await Exam.findOne({studentName, term, session}) // studentClass

        if(!checkExam && !checkTest){
            return res.send({responseCode: "01", message: "The result you want to delete did not exist"})
        }

        let verifiedExam = false
        let verifiedTest = false

        if(checkExam){
            await Exam.findOneAndDelete({studentName, term, session}, // studentClass
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
           await Test.findOneAndDelete({studentName, term, session}, // studentClass
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

router.post('/resultComment', async(req,res) => {
    const {resultType, resultId, adminComment} = req.body

    if(resultType === 'Test'){
        var check = await Test.findOne({_id: resultId})
        if(!check){
            return res.send({responseCode: "01", message: "The result you are trying to comment on did not have test result"})
        }

        await Test.findByIdAndUpdate({_id: resultId}, {
                        
            $set: {
                adminComment
            }
                
            }, {new: true}, (err,doc)=>{
        
            if (!err){
                console.log({message:"successfully updated"})
                return res.send({responseCode: "00", message: "Comment successfully added", updatedResult: doc})
            }
            else{
                console.log("error occured during update")
                return res.send({responseCode: "01", message: "error occured while adding comment"})
            }
        })
    }
    else if(resultType === "Exam"){
        var check = await Exam.findOne({_id: resultId})
        if(!check){
            return res.send({responseCode: "01", message: "The result you are trying to comment on did not have exam result"})
        }
        await Exam.findByIdAndUpdate({_id: resultId}, {
                        
            $set: {
                adminComment
            }
                
            }, {new: true}, (err,doc)=>{
        
            if (!err){
                console.log({message:"successfully updated"})
                return res.send({responseCode: "00", message: "Comment successfully added", updatedResult: doc})
            }
            else{
                console.log("error occured during update")
                return res.send({responseCode: "01", message: "error occured while adding comment"})
            }
        })
    }
})

// router.post("/deleteAll", async(req,res) =>{
//     await Test.deleteMany({}, (err, doc)=>{
//         if(!err){
//            return res.send({responseCode: "00", message: "deleted"})
//         }
//         else{
//             return res.send({responseCode: "01"})
//         }
//     })
// })


module.exports = router