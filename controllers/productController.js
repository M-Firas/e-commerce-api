const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const path = require('path');


//create product controller
const createProduct = async (req, res) => {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);

  res.status(StatusCodes.CREATED).json({ product });
};


//get all products controller
const getAllProducts = async (req, res) => {
  const products = await Product.find({}).populate({path:'reviews'});

  res.status(StatusCodes.OK).json({ products, count: products.length });
};


//get single product controller
const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId });
  //checks if the product exists
  if (!product) {
    throw new CustomError.NotFoundError(`there is no product with id: ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};


//update product controller
const updateProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });
  //checks if the product exists
  if (!product) {
    throw new CustomError.NotFoundError(`there is no product with id: ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};


// delete product controller
const deleteProduct = async (req, res) => {
 const { id:productId } = req.params
 const product = await Product.findOne({_id:productId})
 //checks if the product exists
 if (!product) {
    throw new CustomError.NotFoundError(`there is no product with id: ${productId}`);
  }

  product.remove();
  res.status(StatusCodes.OK).json({msg:'product has been deleted'})

};


//upload image controller
const uploadImage = async (req, res) => {
 if(!req.files){
    throw new CustomError.BadRequestError("no file uploaded")
 }
 
 const productImage = req.files.image; 
 if(!productImage.mimetype.startsWith('image')){
    throw new CustomError.BadRequestError('please upload an Image')
 }

 const maxSize = 1024 * 1024;
 if(productImage.size > maxSize){
    throw new CustomError.BadRequestError('please upload an Image smaller than 1MB')
 }

 const imagePath = path.join(__dirname,'../public/uploads/' + `${productImage.name}`)
 await productImage.mv(imagePath);

 res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` })
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
