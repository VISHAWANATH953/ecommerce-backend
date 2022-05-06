const Order = require('../models/order')
const Product = require('../models/product')
const errorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../middelware/catchAsyncErrors')

//Create new Order
const newOrder = catchAsyncErrors(async (req,res,next)=>{
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice
  } = req.body

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt:Date.now(),
    user:req.user._id
  })

  res.status(201).json({
    success:true,
    order
  })

})

//Get Single Order
const singleOrder = catchAsyncErrors(async(req,res,next)=>{
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  )

  !order && next(new errorHandler('Order Not Found with this id',404))

  res.status(200).json({
    success:true,
    order
  })

})

//Get logged in user Orders
const myOrders = catchAsyncErrors(async(req,res,next)=>{
  const orders = await Order.find({user:req.user._id})

  res.status(200).json({
    success:true,
    orders
  })
})

//Get all Orders (Admin)
const getAllOrders = catchAsyncErrors(async (req,res,next)=>{
  const orders = await Order.find()

  let totalAmount = 0

  orders.forEach((order)=>{
    totalAmount += order.totalPrice
  })

  res.status(200).json({
    success:true,
    totalAmount,
    orders
  })
})

//Update Order Status (Admin)
const updateOrder = catchAsyncErrors(async (req,res,next)=>{
  const order = await Order.findById(req.params.id)

  !order && next(new errorHandler('order not found with this id',404))

  if(order.orderStatus === "Delivered"){
    return next(new errorHandler('You have already Delivered thid order',404))
  }

  if(req.body.status === "Shipped"){
    order.orderItems.forEach(async(o)=>{
      await updateStock(o.Product,o.quantity)
    })
  }

  order.orderStatus = req.body.status

  if(req.body.status === "Delivered"){
  order.deliveredAt = Date.now()
  }

  await order.save({validateBeforeSave:false})

  res.status(200).json({
    success:true
  })

  async function updateStock(id,quantity){
    const product = await Product.findById(id)

    product.Stock -= quantity

    await product.save({validateBeforeSave:false})
  }

})

//Delete Order (Admin)
const deleteOrder = catchAsyncErrors(async (req,res,next)=>{
  const order = await Order.findById(req.params.id)

  !order && next(new errorHandler('Order Not Found With this Id',404))

  await order.remove()

  res.status(200).json({
    success:true
  })
})

module.exports = {newOrder,myOrders,getAllOrders,deleteOrder,updateOrder,singleOrder}
