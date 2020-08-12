require("./models/User")
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
const authRoutes = require("./routes/authRoutes")

const requireAuth = require("./middlewares/requireAuth")
var port = process.env.PORT || 8080 

const app = express() 

app.use(
    cors({
        origin: "*",
        methods: "*"
    })
)

app.use(bodyParser.json())
app.use("/",authRoutes) //  the "/" is not necessary



// fintech.request@gmail.com

const mongoUri = "mongodb+srv://Ridwan:Ridko5267$@analytics-app.zsjxk.mongodb.net/<dbname>?retryWrites=true&w=majority"

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
    console.log("Listening to port 8080")
})