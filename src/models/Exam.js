const mongoose = require('mongoose')


const scoreSchema = new mongoose.Schema({
    
    subject: String,
    score: Number

})


const examSchema = new mongoose.Schema({ 
    
    studentName: {
        type: String,
        required: true
    },
    studentClass: {
        type: String,
        required: true
    },
    teacherName: {
        type: String,
        required: true 
    },
    term: {
        type: String,
        require: true
    },
    session: {
        type: String,
        require: true
    },
    teacherComment: {
        type: String
    },
    adminComment: {
        type: String
    },
    examResult: [scoreSchema]
})

mongoose.model('Exam', examSchema)