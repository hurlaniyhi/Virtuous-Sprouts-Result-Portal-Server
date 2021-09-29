const dotenv = require('dotenv').config()

module.exports = {
    secretKey: process.env.TOKEN_KEY,
    emailUser: process.env.EMAIL_USER,
    emailPass: process.env.EMAIL_PASS,
    newcoreEmail: process.env.NEWCORE_EMAIL,
    newcoreEmailPass: process.env.NEWCORE_EMAIL_PASS,
    cloudName: process.env.CLOUD_NAME,
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET,
    databaseKey: process.env.DATABASE_KEY
}