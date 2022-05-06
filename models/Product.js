const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name:{
    type:String,
    required:[true,"Please Enter Name Of Producr."],
    minlength:[3,"product name should have more than 4 characters."],
    maxlength:[30,"product name cannot exceed 30 characters."],
    unique:[true,'product name was already exist.']
  },
  description:{
    type:String,
    required:[true,"Please Enter description Of Product."],
    minlength:[3,"product name should have more than 4 characters."],
    maxlength:[30,"product name cannot exceed 30 characters."]
  },
  price:{
    type:Number,
    required:[true,"Please Enter Price Of Product."],
    maxlength:[8,"product name cannot exceed 30 characters."]  
  },
  ratings:{
    type:Number,
    default:0
  },
  images:[
    {
      public_id:{
        type:String,
        required:true
      },
      url:{
        type:String,
        required:true
      }
    }
  ],
  category:{
    type:String,
    required:[true,"Please Enter Category Of Product."]
  },
  stock:{
    type:Number,
    required:[true,"Please Enter Product Stock."],
    maxlength:[4,"Stock cannot exceed 4 characters."],
    default:1
  },
  numOfReviews:[
    {
      user:{
        type:mongoose.Schema.ObjectId,
        ref:"user",
        required:true
      },
      name:{
        type:String,
        required:true
      },
      rating:{
        type:Number,
        required:true
      },
      comment:{
        type:String,
        required:true
      }
    }
  ],
  user:{
    type:mongoose.Schema.ObjectId,
    ref:"user",
    required:true
  },
  createdAt:{
    type:Date,
    default:Date.now
  }
  
})

const productModel = mongoose.model('product',productSchema)

module.exports = productModel
