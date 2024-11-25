const Review = require("../models/Review");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { checkPermissions } = require("../utils");

// create review
const createReview = async (req, res) => {
  const { product: productId } = req.body;
  req.body.user = req.user.userId;

  //checks if the product is valid
  const isValid = await Product.findOne({ _id: productId });
  if (!isValid) {
    throw new CustomError.NotFoundError(`no product with id: ${productId}`);
  }

  //checks if the user already reviewed the product
  const isReviewed = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });
  if (isReviewed) {
    throw new CustomError.BadRequestError("product is already reviewed");
  }

  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

// get all reviews
const getAllReviews = async (req, res) => {
  const reviews = await Review.find({})
    .populate({ path: "user", select: "name lastName" })
    .populate({ path: "product", select: "name company price" });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

//get single review
const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId }).populate({ path: "product", select: "name company price" });;

  //checks if the review exists
  if (!review) {
    throw new CustomError.NotFoundError(`no review found with id: ${reviewId}`);
  }

  res.status(StatusCodes.OK).json({ review });
};

//update review
const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const { rating, title, comment } = req.body;
  const review = await Review.findOne({ _id: reviewId });

  //checks if the review exists
  if (!review) {
    throw new CustomError.NotFoundError(`no review found with id: ${reviewId}`);
  }
  //only admin can delete a review
  checkPermissions(req.user, review.user);

  review.rating = rating;
  review.title = title;
  review.comment = comment;
  await review.save();

  res.status(StatusCodes.OK).json({ review });
};

//delete review
const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });

  //checks if the review exists
  if (!review) {
    throw new CustomError.NotFoundError(`no review found with id: ${reviewId}`);
  }

  //only admin can delete a review
  checkPermissions(req.user, review.user);
  await review.remove();

  res.status(StatusCodes.OK).json({ msg: "The review has been deleted" });
};


// get single product reviews
const getSigleProductReviews = async (req,res) => {
  const { id:productId } = req.params
  const reviews = await Review.find({product:productId})
  
   //checks if the reviews exists
   if (!reviews) {
     throw new CustomError.NotFoundError(`no product review found with id: ${productId}`);
   }

  res.status(StatusCodes.OK).json({ reviews, count:reviews.length });
}



module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSigleProductReviews
};
