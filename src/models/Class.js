const mongoose = require('mongoose')

const classSchema = new mongoose.Schema({ 
    class: {
        type: String,
        required: true,
        unique: true,
    },
    dateAdded: {
        type: String
    }
})

mongoose.model('Class', classSchema)