const Product = require('../models/product')
const errorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../middelware/catchAsyncErrors')
const cloudinary = require('cloudinary')
const ApiFeatures = require('../utils/apiFeatures')

//create Products
const createProduct = catchAsyncErrors(async(req,res,next)=>{
  let images = []

  if(typeof req.body.images === "string"){
    images.push(req.body.images)
  }else{
    images = req.body.images
  }

  const imagesLinks = [];

  for(let i = 0;i < images.length; i++){
    const result = await cloudinary.v2.uploader.upload(images[i],{
      folder:"products"
    })

    imagesLinks.push({
      public_id:result.public_id,
      url:result.secure_url
    })
  }

  req.body.images = imagesLinks
  req.body.user = req.user.id

  const product = await Product.create(req.body)

  res.status(201).json({
    success:true,
    message:'Product Created Successfully',
    product
  })
})

//get products
const getProducts = catchAsyncErrors(async(req,res,next)=>{
  const resultPerPage = 8
  const productCount = await Product.countDocuments()

  const apiFeature = new ApiFeatures(await Product.find(),req.query).search().filter()

  let products = await apiFeature.query

  let filteredProductsCount = products.length

  apiFeature.pagination(resultPerPage)

  products = await apiFeature.query

  res.status(200).json({
    success:true,
    products,
    productCount,
    resultPerPage,
    filteredProductsCount
  })
})


//get all products (Admin)
const getAllProductsAdmin = catchAsyncErrors(async(req,res,next)=>{
  const products = await Product.find({})

  res.status(200).json({
    success:true,
    products
  })
})

//update Product (Admin)
const updateProduct = catchAsyncErrors(async (req,res,next)=>{
  let product = await Product.findById(req.params.id)

  !product && next(new errorHandler('Product Not Found',400))

  let images = []

  if(typeof req.body.images === 'string'){
  images.push(req.body.images)
  }else{
  images = req.body.images
  }

  if(images !==undefined){

  for(let i = 0;i<product.images.length;i++){
      await cloudinary.v2.uploader.destroy(product.images[i].public_id)
    }

  const imagesLinks = []

  for (let i = 0;i<images.length;i++){
    const result = await cloudinary.v2.uploader.upload(images[i],{
      folder:'products'
    })

    imagesLinks.push({
      public_id:result.public_id,
      url:result.secure_url
    })

    req.body.images = imagesLinks
  }

  product = await Product.findByIdAndUpdate(req.params.id,req.body,{
      new:true,
      runValidators:true,
      useFindAndModify:false
    })

 res.status(200).json({
      success:true,
      product
    })
  }
})

//get product details
const getProductDetails = catchAsyncErrors(async(req,res,next)=>{
  const product = await Product.findById(req.params.token)

  !product && next(new errorHandler('Product Not Found.',400))

  res.status(200).json({
    success:true,
    product
  })
})

//delete product (Admin)
const deleteProduct = catchAsyncErrors(async (req,res,next)=>{
  const product = await Product.findById(req.query.id)

  !product && next(new errorHandler('Product Not Found'),400)

  for(let i = 0;i< product.images.length; i++){
    await cloudinary.v2.uploader.destroy(product.images[i].public_id)
  }

  await product.remove()

  res.status(200).json({
    success:true,
    message:'Product Deleted Successfully'
  })
})

//Create New Review or Update the Review
const createProductReview = catchAsyncErrors(async (req,res,next)=>{
  const {rating,comment,productId} = req.body

  const review = {
    user:req.user._id,
    name:req.user.name,
    rating: Number(rating),
    comment
  }

  const product = await Product.findById(productId)

  const isReviewed = product.reviews.find(
    (rev)=>rev.user.toString()===req.user._id.toString()
  )
  
  if(isReviewed){
    product.reviews.forEach((rev)=>{
      if(rev.user.toString()===req.user._id.toString()){
        (rev.rating= rating), (rev.comment = comment)
      }
      else{
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length
      }
    })
  }

  let avg = 0

  product.reviews.forEach((rev)=>{
    avg += rev.rating
  })

  product.ratings = avg / product.reviews.length

  await product.save({validateBeforeSave:false})

  res.status(200).json({
    success:true
  })
})

//get all product reviews
const getProductReviews = catchAsyncErrors(async (req,res,next)=>{
  const product = await Product.findById(req.query.id)

  !product && next(new errorHandler('Product Not Found,404'))

  res.status(200).json({
    success:true,
    reviews:product.reviews
  })
})

//delete product review
const deleteProductReview = catchAsyncErrors(async (req,res,next)=>{
  const product = await Product.finById(req.query.productId)

  !product && next(new errorHandler('Product Not Found',404))

  const reviews = product.review.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  )

  let avg = 0

  reviews.forEach((rev)=>{
    avg += rev.rating
  })

  let ratings = 0

  if(reviews.length === 0){
    ratings = 0
  }else{
    ratings = avg / reviews.length
  }

  const numOfReviews = reviews.length

  await Product.findByIdAndUpdate(
    req.query.productId,{
     reviews,
      ratings,
      numOfReviews
    },
    {
      new:true,
      runValidators:true,
      useFindAndModify:false
    }
  )

  res.status(200).json({
    success:true
  })
})

module.exports = {createProduct,getProducts,updateProduct,getProductDetails,getProductReviews,deleteProduct,deleteProductReview,createProductReview,getAllProductsAdmin}
