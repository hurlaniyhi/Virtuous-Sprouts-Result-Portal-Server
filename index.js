require("./src/models/Associate")
require("./src/models/Test")
require("./src/models/Exam")
require("./src/models/Class")
require("./src/models/Subject")
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
const authRoute = require("./src/routes/authRoute")
const resultRoute = require("./src/routes/resultRoute")
const messageRoute = require("./src/routes/messageRoute")
// const uploadRoute = require("./routes/uploadRoute")
// const documentRoute = require("./routes/documentRoute")
const basicInfoRoute = require("./src/routes/basicInfoRoute")
const {databaseKey} = require('./src/config')
const requireAuth = require("./src/middlewares/requireAuth")
var port = process.env.PORT || 5000 
const app = express() 
app.use(cors());

app.use(bodyParser.json())
app.get('/', (req, res) => {
    res.send({message: 'This is Virtuous Sprouts Academy Server'}) 
})
app.use("/", authRoute)
app.use("/", resultRoute)
app.use("/", messageRoute)
app.use("/", basicInfoRoute)


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
