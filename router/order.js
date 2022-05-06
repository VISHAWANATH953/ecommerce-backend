const express = require('express')
const {
  newOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder
} = require('../controllers/order')
const {isAuthUser,isAuthAdmin} = require('../middelware/auth')
const router = express.Router()

//public paths
router.route('/order/new').post(isAuthUser,newOrder)
router.route('/order/:id').get(isAuthUser,getSingleOrder)
router.route('/me/orders/').get(isAuthUser,myOrders)

//admin paths
router.route('/admin/orders').get(isAuthAdmin,getAllOrders)
router.route('/admin/order/:id').put(isAuthAdmin,updateOrder).delete(isAuthAdmin,deleteOrder)

module.exports = router
