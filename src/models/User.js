const mongoose = require('mongoose')
const bcrypt = require('bcrypt')


const acctInfoSchema = new mongoose.Schema({ 
    accountNumber: {
        type: String,
        required: true
    },
    accountType: {
        type: String,
        required: true
    }
})

const userSchema = new mongoose.Schema({ 
    
    
    fullName: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true,
        unique: true   
    },
    customerID: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    BVN: {
        type: String,
    },
    accountLength: {
        type: Number,
        required: true
    },
    accountInfo: [acctInfoSchema]
})


userSchema.pre('save', function(next) { 
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



userSchema.methods.comparePassword = function comparePassword(candidatePassword){
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

mongoose.model('Customer', userSchema)