const express = require("express");
const router = express.Router();

const {authenticateUser,authorizePermissions} = require('../middleware/authentication')

const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} = require("../controllers/productController");

const { getSigleProductReviews } = require("../controllers/reviewController")


router.route('/').get(getAllProducts);
router.route('/').post(authenticateUser,authorizePermissions('admin'),createProduct);
router.route('/uploadImage').post(authenticateUser,authorizePermissions('admin'),uploadImage);
router.route('/:id').patch(authenticateUser,authorizePermissions('admin'),updateProduct);
router.route('/:id').delete(authenticateUser,authorizePermissions('admin'),deleteProduct);
router.route('/:id').get(getSingleProduct);
router.route('/:id/reviews').get(getSigleProductReviews);




module.exports = router;