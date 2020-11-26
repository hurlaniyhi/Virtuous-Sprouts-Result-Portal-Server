require("./models/User")
require("./models/File")
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
const authRoute = require("./routes/authRoute")
const messageRoute = require("./routes/messageRoute")
const uploadRoute = require("./routes/uploadRoute")
const documentRoute = require("./routes/documentRoute")
const {databaseKey} = require('./config')

const requireAuth = require("./middlewares/requireAuth")
var port = process.env.PORT || 5000 

const app = express() 

app.use(
    cors({
        origin: "*",
        methods: "*"
    })
)

app.use(bodyParser.json())
app.use("/",authRoute)
app.use("/",documentRoute)
app.use("/",messageRoute)
app.use("/",uploadRoute)



// fintech.request@gmail.com

const mongoUri = databaseKey

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

mongoose.connection.on('connected', () => {
    console.log("connected to mongodb cloud")
})

mongoose.connection.on('error', (err) => {
    console.error("Error connecting to mongodb cloud", err)
})

app.get('/',requireAuth, (req, res) => {
    res.send({userId: req.user.email})
})




app.listen(port, ()=>{
    console.log(`Listening to port ${port}`)
})