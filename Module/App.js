
const express = require('express')
const multer = require('multer')
const cors = require('cors')
const cookieParser = require('cookie-parser');
const ProductsRoute=require("../Routes/ProductsRoute.js")

const {limiter}=require("../Service/ServerService.js")
const createError = require('http-errors')
const morgan = require('morgan')
const bodyParser=require("body-parser")
const app = express()



app.use(morgan("dev"))
app.use(limiter)
/*app.use(cors({
  origin:"http://localhost:5173",
  methods:"GET,POST,PUT,DELETE"
}))*/

app.use(cors({
  origin:["https://react-app-ssv3.onrender.com"],
  methods:["GET","POST","DELETE","PUT"],
  credentials:true
}))
//app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended:true }))
app.use(cookieParser())
app.use("/products",ProductsRoute)

app.get("/",(req,res)=>{
  res.status(200).send("hello world render.com ")
})

app.get('/home', (req,res) => {
 return res.send({
    message:"hello Homes",
  })
})


app.use((req,res,next)=>{

  return next(createError(404,"Route not found"))
})
app.use((error,req,res,next)=>{
  res.status(500).json({
    message:`${error.message}`,
  })
})

module.exports=app