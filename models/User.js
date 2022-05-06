const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    username:{
    type:String,
    required:[true,"username was require."],
    minlength:[4,"username should have more than 4 characters."],
    maxlength:[30,"username cannot exceed 30 characters."],
    unique:[true,"username already exist"],
    trim:true
  },email:{
    type:String,
    required:[true,"email was require."],
    minlength:[5,"email should have more than 5 characters."],
    maxlength:[250,"email cannot exceed 250 characters."],
    validate:[validator.isEmail,"Please enter a valid email."],
    unique:[true,"email already exist"],
    trim:true
  },password:{
    type:String,
    required:[true,"password was require."],
    minlength:[8,"Password should be greater than 8 characters."],
    trim:true,
    select:false
  },avater:{
    public_id:{
      type:String,
      required:true
    },
    url:{
      type:String,
      required:true
    }
  },isAdmin:{
  type:Boolean,
  default:false
  },createdAt:{
    type:Date,
    default:Date.now
  },
  resetPasswordToken:String,
  resetPasswordExpire:Date,
})

//hash password
userSchema.pre("save",async function(next){
  if(!this.isModified("password")){
    next();
  }
  this.password = await bcrypt.hash(this.password,10)
})

//JWT TOKEN
userSchema.methods.getJWToken = function(){
  return jwt.sign({id:this._id},process.env.JWT_SECRET,{
    expiresIn:process.env.JWT_EXPIRE
  })
}

//Compare password
userSchema.methods.comparePass = async function (password){
  return await bcrypt.compare(password,this.password)
}

//generate pass TOKEN
userSchema.methods.resetPassToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex')

  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000

  return resetToken
}

const userModel = mongoose.model('user',userSchema)

module.exports = userModel
