const mongoose = require('mongoose')


const fileSchema = new mongoose.Schema({ 
    
    staffId: {
        type: String,
        required: true
    },
    fileBinary: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true 
    },
    gfsId: {
        type: String,
        require: true
    },
    description: {
        type: String,
    }
})

mongoose.model('File', fileSchema)