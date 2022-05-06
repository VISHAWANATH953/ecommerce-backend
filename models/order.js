const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  shippingInfo:{
    address:{
      type:String,
      required:[true,'address was required.']
    },
    city:{
      type:String,
      required:[true,'city name was required.']
    },
    state:{
      type:String,
      required:[true,'state name was required.']
    },
    country:{
      type:String,
      required:[true,'country name was required.']
    },
    pinCode:{
      type:Number,
      required:[true,'pin code was required.']
    },
    phoneNo:{
      type:Number,
      required:[true,'phone number was required.']
    }
  },
  orderItems:[
    {
      name:{
        type:String,
        required:[true,'name was required.']
      },
      price:{
        type:Number,
        required:[true,'price was required.']
      },
      image:{
        type:String,
        required:[true,'image was required.']
      },
      product:{
        type:mongoose.Schema.objectId,
        ref:"Product",
        required:true
      }
    }
  ],
  user:{
    type:mongoose.Schema.objectId,
    ref:'User',
    required:[true,'user was required.']
  },
  paymentInfo:{
    id:{
      type:String,
      required:true
    },
    status:{
      type:String,
      required:true
    }
  },
  paidAt:{
    type:Date,
    required:true
  },
  itemsPrice:{
    type:Number,
    required:true,
    default:0
  },
  shippingPrice:{
    type:Number,
    required:true,
    default:0
  },
  totalPrice:{
    type:Number,
    required:true,
    default:0
  },
  orderStatus:{
    type:String,
    rquired:true,
    default:'Processing'
  },deliverdAt:Date,
  createdAt:{
    type:Date,
    default:Date.now
  }
})

const orderModel = mongoose.model('order',orderSchema)

module.exports = orderModel 
