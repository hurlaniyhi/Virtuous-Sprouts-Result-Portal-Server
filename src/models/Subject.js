const mongoose = require('mongoose')

const subjectSchema = new mongoose.Schema({ 
    subject: {
        type: String,
        required: true,
        unique: true
    },
    dateAdded: {
        type: String
    }
})

mongoose.model('Subject', subjectSchema)