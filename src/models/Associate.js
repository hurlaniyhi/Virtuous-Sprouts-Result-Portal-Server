const mongoose = require('mongoose')
const bcrypt = require('bcrypt')


const associateSchema = new mongoose.Schema({ 
    
    
    firstName: {
        type: String,
        required: true
    },
    middleName: {
        type: String,
    },
    surname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true 
    },
    username: {
        type: String,
        required: true,
        unique: true 
    },
    password: {
        type: String,
        required: true
    },
    passRecovery: {
        type: String,
        required: true
    },
    regId: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    memberClass: {
        type: String,
        required: true
    },
    memberType: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String
    },
    regDate: {
        type: String
    }
})


associateSchema.pre('save', function(next) { 
    // the reason we are not using a call back function is to have access to "this"
    const user = this
    if(!user.isModified('password')){
        return next()
    }
    bcrypt.genSalt(10, (err, salt) => {
        if(err){
            return next(err)   // anytime we return, that will not execute any code anymore
        }
        bcrypt.hash(user.password, salt, (err, hash)=>{
            if(err){
              return next(err)
            }
            user.password = hash
            next()
        })
    })
})



associateSchema.methods.comparePassword = function comparePassword(candidatePassword){
    // candidate password is the password the user is trying to login with
    const user = this   // existing user....user.password will be the existing password that has been saved in the db

    return new Promise ((resolve, reject) => {
        bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
            if (err){
                return reject(err)
            }
            if(!isMatch){
                return reject(false)
            }
            if(isMatch){
                return resolve(true)
            }
            
        })
    })
}

mongoose.model('Associate', associateSchema)