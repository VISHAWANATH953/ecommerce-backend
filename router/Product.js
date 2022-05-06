const {isAuthAdmin,isAuthUser} = require('../middelware/auth')
const {
  getProducts,
  getAllProductsAdmin,
  getProductDetails,
  getProductReviews,
  createProduct,
  deleteProduct,
  updateProduct,
  deleteProductReview,
  createProductReview
} = require('../controllers/product')
const express = require('express')
const router = express.Router() 

//public paths
router.route('/products').get(getProducts)
router.route('/product/:id').get(getProductDetails)
router.route('review').put(isAuthUser,createProductReview)
router.route('/reviews').get(getProductReviews).delete(isAuthUser,deleteProductReview)

//admin paths
router.route('/admin/products').get(isAuthAdmin,getAllProductsAdmin)
router.route('/admin/products/new').post(isAuthAdmin,createProduct)
router.route('/admin/product/:id').put(isAuthAdmin,updateProduct).delete(isAuthAdmin,deleteProduct)

module.exports = router
