const jwt = require("jsonwebtoken")
const mongoose = require('mongoose')
const Staff = mongoose.model('Staff')
const {secretKey} = require('../config')


module.exports = (req, res, next) => {
    const {authorization} = req.headers

    if (!authorization){
        return res.send({message: "You must be logged in"})
    }
    else{
        const token = authorization.replace("Bearer ", "")

        jwt.verify(token, secretKey, async(err, payload) => {
            if(err){
                return res.send({message: "You must be logged in"})
            }
            else{
                const {staffId} = payload
                const staff = await Staff.findById(staffId)
                req.staff = staff
                next()
            }
        })
    }
}