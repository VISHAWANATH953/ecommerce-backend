const User = require('../models/user')
const catchAsyncErrors = require('../middelware/catchAsyncErrors')
const errorHandler = require('../utils/errorHandler')
const cloudinary = require('cloudinary')
const sendToken = require('../utils/sendToken')
const sendEmail = require('../utils/sendEmail')

//create user
const registerUser =  catchAsyncErrors(async(req,res,next)=>{
  const {username,name,email,password} = req.body
  const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar,{
    folder:'avatars',
    width:150,
    crop:'scale'
  })
  const user = await User.create({name,username,email,password,avatar:{
    public_id:myCloud.public_id,
    url:myCloud.secure_url
  }})
  sendToken(user,201,res)

})

//login user
const login = catchAsyncErrors(async(req,res,next)=>{
  const {email,password} = req.body

  if(!email||!password){
    return next(new errorHandler("Please Enter Email & Password",400))
  }

  const user = await User.findOne({email}).select("+password")

  !user && next(new errorHandler("InValid Email & Password",401))

  const isPassMatch = await user.comparePass(password)

  !isPassMatch && next(new errorHandler("InValid Email & Password",401))

  sendToken(user,200,res)
}) 

//logout user
const logout = catchAsyncErrors(async(req,res,next)=>{
  res.cookie("token",null,{
    expires: new Date(Date.now()),
    httpOnly:true
  })
  res.status(200).json({
    success:true,
    message:"Logged Out"
  })
})

//forget password
const forgetPass = catchAsyncErrors(async(req,res,next)=>{
  const user = User.find({email:req.body.email})

  !user && next(new errorHandler("user not found",404))

  const resetToken = user.getResetPassToken

  await user.save({validateBeforeSave:false})

  const resetPassUrl = `${req.protocol}://${req.get("host")}/password/reset/${resetToken}`

  const message = `Your Password reset token is:- \n\n ${resetPassUrl} \n\n If you have not requested this email then,please ignore it.`

  try{
    await sendEmail({
      email:user.email,
      subject: 'Ecommerce Password Recover',
      message
    })

    res.status(200).json({
      success:true,
      message: `Email send successfully to ${user.email}.`
    })

  }catch(e){
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save({validateBeforeSave:false})

    return next(new errorHandler(e.message,500))
  }
  
})

//reset password
const resetPass = catchAsyncErrors(async(req,res,next)=>{
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire:{$gt:Date.now()}
  })

  !user && next(new errorHandler('Reset Password Token is InValid or has been expired.',400))

  if(req.body.password !== req.body.confirmPass){
    return next(new errorHandler('password not match confirm password', 400))
  }

  user.password = req.body.password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined

  await user.save()

  sendToken(user,200,res)

})


//get user details
const getUserDetails = catchAsyncErrors(async(req,res,next)=>{
  const user = await User.findById(req.user.id)

  !user && next(new errorHandler(`User Does Not Exist With Id:${req.user.id}`,))

  res.status(200).json({
    success:true,
    user
  })
})

//get user details by id
const getUserDetailsById = catchAsyncErrors(async(req,res,next)=>{
  const user = await User.findById({_id:req.params.id})

  !user && next(new errorHandler(`User Does Not Exist With Email:${req.params.id}`,))

  res.status(200).json({
    success:true,
    user
  })
})

//get user deatisl by email
const getUserDetailsByEmail = catchAsyncErrors(async(req,res,next)=>{
  const user = await User.findOne({email:req.body.email})

  !user && next(new errorHandler(`User Does Not Exist With Email:${req.body.email}`,400))

  res.status(200).json({
    success:true,
    user
  })
})

//update password
const updatePass = catchAsyncErrors(async(req,res,next)=>{
  const {oldPass,newPass,confirmPass} = req.body

  const user = await User.findById(req.user.id).select("+password")

  const isPassMatch = await user.comparePass(oldPass)

  !isPassMatch && next(new errorHandler("Old Password Was Incorrect",400))

  if(newPass !== confirmPass){
    return next(new errorHandler("Password Does Not Match",400))
  }

  user.password = newPass

  await user.save()

  sendToken(user,200,res)
})

//update profile
const updateProfile = catchAsyncErrors(async(req,res,next)=>{
  const {name,username,email} = req.body

  const data = {name,username,email}

  if(req.body.avatar !== ""){
    const user = User.findById(req.params.id)

    const imgId = user.avatar.public_id

    await cloudinary.v2.uploader.destroy(imgId)

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar,{
      folder:"avatars",
      width:150,
      crop:"scale"
      })

    data.avatar = {
      public_id:myCloud.public_id,
      url:myCloud.secure_url
    }
  }

  const user = await User.findById(req.params.id,data,{
    new:true,
    runValidators:true,
    useFindAndModify:false
  })

  user && res.status(200).json({
    success:true
  })
})

//get all users(Admin)
const getAllUsers = catchAsyncErrors(async(req,res,next)=>{
  const users = await User.find({})

  res.status(200)

  res.status(200).json({
    success:true,
    users
  })
})


//update user role(Admin)
const updateUserRole = catchAsyncErrors(async(req,res,next)=>{
  const {name,username,email,role} = req.body

  const data = {name,username,email,role}

  await User.findByIdAndUpdate(req.params.id,data,{
    new:true,
    runValidators:true,
    useFindAndModify:false
  })

  res.status(200).json({
    success:true
  })
})

//delete user(Admin)
const deleteUser = catchAsyncErrors(async (req,res,next)=>{
  const user = await User.findById(req.params.id)

  !user && new errorHandler(`User Does Not Exist With Id:${req.params.id}`,400)

  const imgId = user.avatar.public_id

  await cloudinary.v2.uploader.destroy(imgId)

  await user.remove()

  res.status(200).json({
    success:true,
    message:"User Deleted Successfully"
  })
})

module.exports = {registerUser,deleteUser,updateUserRole,updateProfile,getUserDetails,getUserDetailsById,getUserDetailsByEmail,forgetPass,resetPass,login,logout,updatePass}
