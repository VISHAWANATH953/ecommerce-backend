const express = require('express')
const {
  registerUser,
  login,
  logout,
  forgetPass,
  resetPass,
  getUserDetails,
  getUserDetailsById,
  getUserDetailsByEmail,
  updatePass,
  updateProfile,
  updateUserRole,
  deleteUser,
  getAllUsers

} = require('../controllers/user')
const {isAuthUser,isAuthAdmin} = require('../middelware/auth')

const router = express.Router()

//public routes
router.route("/register").post(registerUser)
router.route("/login").post(login)
router.route("/password/forget").post(forgetPass)
router.route("/password/reset/:token").put(resetPass)
router.route("/logout").get(logout)
router.route("/me").post(isAuthUser,getUserDetails)
router.route("/password/update").put(isAuthUser,updatePass)
router.route("/me/update").put(isAuthUser,updateProfile)

//admin paths
router.route("/admin/users").post(isAuthAdmin,getAllUsers)
router.route("/admin/user/:id").get(isAuthAdmin,getUserDetailsById).put(isAuthAdmin,updateUserRole).delete(isAuthAdmin,deleteUser)
router.route("/admin/user").post(isAuthAdmin,getUserDetailsByEmail)

module.exports = router
