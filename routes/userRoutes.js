const express = require("express");
const router = express.Router();
const {authenticateUser,authorizePermissions} = require('../middleware/authentication')
const {
  getAllUsers,
  getSingleUser,
  getCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/userController");



router.route('/').get(authenticateUser,authorizePermissions('admin'),getAllUsers);
router.route('/getCurrentUser').get(authenticateUser,getCurrentUser);
router.route('/updateUser').patch(authenticateUser,updateUser);
router.route('/updateUserPassword').patch(authenticateUser,updateUserPassword);
router.route('/:id').get(authenticateUser,getSingleUser);


module.exports = router;