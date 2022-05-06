const errorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('./catchAsyncErrors')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const isAuthUser = catchAsyncErrors(async (req,res,next)=>{
  const {token} = req.cokkies

  !token && next(new errorHandler('Please Login to access this resource',401))

  const decoded = jwt.verify(token,process.env.JWT_SECRET)

  req.user = await User.findById(decoded.id)

  next()
})

const isAuthAdmin = catchAsyncErrors(async (req,res,next)=>{
  const {token} = req.cokkies

  !token && next(new errorHandler('Please Login to access this resource',401))

  const decoded = jwt.verify(token,process.env.JWT_SECRET)

  const user = await User.findById(decoded.id)

  !user.isAdmin && next(new errorHandler('your role was not admin',400))

  req.user = user

  next()
})

module.exports = {isAuthUser,isAuthAdmin}
