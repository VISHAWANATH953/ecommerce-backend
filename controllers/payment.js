const catchAsyncErrors = require("../middelware/catchAsyncErrors")

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const processPayment = catchAsyncErrors(async (req,res,next)=>{
  const myPayment = await stripe.paymentIntents.create({
    amount:req.body.anount,
    currency:'inr',
    metadata:{
      company:'Ecommerce'
    }})

  res.status(200).json({
  success:true,
  client_secret:myPayment.client_secret
  }) 
})

const sendStripeApiKey = catchAsyncErrors(async (req,res,next)=>{
  res.status(200).json({stripeApiKey:process.env.STRIPE_API_KEY})
})

module.exports= {processPayment,sendStripeApiKey}
