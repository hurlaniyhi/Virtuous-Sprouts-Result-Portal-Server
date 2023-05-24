const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Class = mongoose.model("Class");
const Subject = mongoose.model("Subject");
const Associate = mongoose.model("Associate");
const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();
router.use(requireAuth)

router.post("/addClass", async(req, res) => {
    try {
        if (!req.body.class && !req.body.length)  return res.status(400).json({responseCode: "400", message: "Kindly provide the class you want to add"})
        const dateAdded = `${new Date().getDate()}/${new Date().getMonth()+1}/${new Date().getFullYear()}`

        if (typeof(req.body.class) === 'string') req.body.class = [req.body.class] 

        for (let item of req.body.class) {
            const newClass = new Class({
                class: item,
                dateAdded
            })
    
            await newClass.save()
        }

        return res.send({responseCode: "00", message: "Successully added class"})
    }
    catch (err) {
        return res.send({responseCode: "101", message: err.message, error: err})
    }
})

router.get("/allClasses", async(req, res) => {
    try {
        const classes = await Class.find({})

        if(classes.length){
            return res.send({responseCode: "00", message: "success", info: classes})
        }
        else{
            return res.send({responseCode: "01", message: "The platform did not have any class", info: classes})
        }
    }
    catch (err) {
        return res.send({responseCode: "500", message: err.message, error: err})
    }
})

router.post("/addSubject", async(req, res) => {
    try {
        if (!req.body.subject && !req.body.subject.length)  return res.status(400).json({responseCode: "400", message: "Kindly provide the subject you want to add"})
        const dateAdded = `${new Date().getDate()}/${new Date().getMonth()+1}/${new Date().getFullYear()}`

        if (typeof(req.body.subject) === 'string') req.body.subject = [req.body.subject] 

        for (let item of req.body.subject) {
            const newSubject = new Subject({
                subject: item,
                dateAdded
            })
    
            await newSubject.save()
        }

        return res.send({responseCode: "00", message: "Successully added subject"})
    }
    catch (err) {
        return res.send({responseCode: "500", message: err.message, error: err})
    }
})

router.get("/allSubjects", async(req, res) => {
    try {
        const subjects = await Subject.find({})

        if(subjects.length){
            return res.send({responseCode: "00", message: "success", info: subjects})
        }
        else{
            return res.send({responseCode: "404", message: "The platform did not have any subject", info: subjects})
        }
    }
    catch (err) {
        return res.send({responseCode: "500", message: err.message, error: err})
    }
})

router.get("/basicAppInfo", async(req, res) => {
    try {
        const users = await Associate.find({})
        const classes = await Class.find({})
        const subjects = await Subject.find({})

        return res.send({responseCode: "00", message: "Information successfully retrieved", info: {users, classes, subjects}})
    }
    catch (err) {
        return res.send({responseCode: "500", message: err.message, error: err})
    }
})

module.exports = router;