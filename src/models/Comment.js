const mongoose = require('mongoose')


const commentSchema = new mongoose.Schema({ 
    user: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    }
})

mongoose.model('Comment', commentSchema)