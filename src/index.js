require("./models/Associate")
require("./models/Test")
require("./models/Exam")
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
const authRoute = require("./routes/authRoute")
const resultRoute = require("./routes/resultRoute")
const messageRoute = require("./routes/messageRoute")
// const uploadRoute = require("./routes/uploadRoute")
// const documentRoute = require("./routes/documentRoute")
const {databaseKey} = require('./config')

const requireAuth = require("./middlewares/requireAuth")
var port = process.env.PORT || 5000 

const app = express() 

app.use(cors({
    origin: '*', 
    methods: '*'
}));

app.use(bodyParser.json())
app.get('/', (req, res) => {
    res.send({message: 'Welcome back'})
})
app.use("/",authRoute)
app.use("/",resultRoute)
app.use("/",messageRoute)


// fintech.request@gmail.com
//web: node src/index.js

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
