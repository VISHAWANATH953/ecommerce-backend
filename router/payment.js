const express = require('express')
const{
  processPayment,
  sendStripeApiKey
} = require('../controllers/payment')
const {isAuthUser} = require('../middelware/auth')
const router = express.Router()

router.route('/payment/process').post(isAuthUser,processPayment)
router.route('/stripeapikey').get(isAuthUser,sendStripeApiKey)

module.exports = router
