const mongoose = require('mongoose')


const scoreSchema = new mongoose.Schema({
    
    subject: String,
    score: Number

})


const testSchema = new mongoose.Schema({ 
    
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
    testResult: [scoreSchema]
})

mongoose.model('Test', testSchema)