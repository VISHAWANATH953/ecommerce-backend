const mongoose = require('mongoose')
if(process.env.NODE_ENV!=='production'){
 require('dotenv').config('./config')
}

const connectDB = async () =>{ 
  await mongoose.connect(process.env.DB,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
  }).then((data)=>{
    console.log(`Mongodb connect with server: ${data.connection.host}`)
  })
}

module.exports = connectDB
