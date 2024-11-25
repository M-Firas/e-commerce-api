const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {cookiesToResponse,createTokenUser} = require('../utils')

// user register controller
const register = async (req, res) => {

 // check if the email is taken
  const { email,name,lastName,password } = req.body;
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    throw new CustomError.BadRequestError("email is taken!");
  }

 // register first user as an admin
 const isFirstAccount = await User.countDocuments({}) === 0;
 const role = isFirstAccount? 'admin':'user'

 // creating a user and assinging JWT Token
 const user = await User.create({ email,name,lastName,password,role });
 const tokenUser = createTokenUser(user);
 

 //cookie setup
 cookiesToResponse({res,user:tokenUser})

 res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

// user login controller
const login = async (req, res) => {
  const {email,password} = req.body

  //checking if email and password passed by the user
  if(!email || !password){
    throw new CustomError.BadRequestError("please provide email and password");
  }
  
  //checking if the user exists
  const user = await User.findOne({ email });
  if(!user){
    throw new CustomError.UnauthenticatedError('Invailed Email or Password')
  }

  //checking if the password is correct 
  const isPasswordCorrect = await user.comparePassword(password)
  if(!isPasswordCorrect){
    throw new CustomError.UnauthenticatedError('Invaild Email or Password')
  }

  //signing in the user
 const tokenUser = createTokenUser(user);
 cookiesToResponse({res,user:tokenUser})
 
 res.status(StatusCodes.OK).json({ user: tokenUser });
};

// user logout controller
const logout = async (req, res) => {
 res.cookie('token','logout', {
  httpOnly:true,
  expires: new Date(Date.now() + 5000),
 });
 res.status(StatusCodes.OK).json({msg:'user logged out'})
};

module.exports = {
  register,
  login,
  logout,
};
