const express = require('express')
const cloudinary = require('cloudinary')
const connectDB = require('./config/db')
const fileUpload = require('express-fileupload')
const compression = require('compression')
const path = require('path')

// Handling Uncaught Exception
process.on("uncaughtException",(err)=>{
  console.log(`Error: ${err.message}`)
  console.log('shutting down the server due to uncaught exception.')
  process.exit(1)
})

//connecting to database
connectDB(process.env)

cloudinary.config({
  cloud_name:process.env.CLOUDINARY_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET_KEY
})

//init app
const app = express();

//configs
if(process.env.NODE_ENV!=='production'){
 require('dotenv').config('./config')
}

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(fileUpload())
app.use(compression())

// Route Imports
const product = require('./router/product')
//const user = require('./router/user')
const order = require('./router/order')
const payment = require('./router/payment')


app.use('/api/v1',product,payment,order)

app.use(express.static(path.join(__dirname,'../frontend/build')))

app.get('*',(req,res)=>{
  res.sendFile(path.resolve(__dirname,'../frontend/build/index.html'))
})

app.listen(process.env.PORT,()=>{
  console.log(`it was running on ${process.env.PORT}`)
})

//Unhandled Promise Rejection
process.on("unhandledRejection",(err)=>{
  console.log(`Error: ${err.message}`)
  console.log('shutting down he server due to unhandled rejection.')

  server.close(()=>{
    process.exit(1)
  })
})
