const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { cookiesToResponse, createTokenUser, sendVerificationEmail } = require('../utils')
const crypto = require('crypto')

// user register controller
const register = async (req, res) => {
  // checking if the email is taken
  const { email, name, lastName, password, confirmPassword } = req.body;
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    throw new CustomError.BadRequestError("email is taken!");
  }
  // registering first user as an admin
  const isFirstAccount = await User.countDocuments({}) === 0;
  const role = isFirstAccount ? 'admin' : 'user';

  // creating a verfication token 
  const verificationToken = crypto.randomBytes(40).toString('hex');

  // Creating a new user instance but not saving yet
  const user = new User({ email, name, lastName, password, role, verificationToken });

  //sending the verfication email
  const origin = "http://localhost:3000"
  await sendVerificationEmail({ name: user.name, email: user.email, verificationToken: user.verificationToken, origin })

  // Setting the confirmPassword virtual field
  user.confirmPassword = confirmPassword;

  // Saving the user (triggering pre('save') validation)
  await user.save();

  // only in postman!
  res.status(StatusCodes.CREATED).json({ msg: 'Success! Please Check Your Email to verify Account' })


};

// verfiy email controller
const verfiyEmail = async (req, res) => {
  const { email, verificationToken } = req.body

  // checking if the user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError('user does not exist!')
  }

  // checking if the token exists
  if (user.verificationToken !== verificationToken) {
    throw new CustomError.UnauthenticatedError('Verification Failed!')
  }

  // verifying the user
  user.isVerified = true,
    user.verified = Date.now()
  // setting the verificationtoken value to empty
  user.verificationToken = ""

  // saving the user
  await user.save()

  res.status(StatusCodes.OK).json({ msg: "Email has been verified successfully!" })
}


// user login controller
const login = async (req, res) => {
  const { email, password } = req.body

  //checking if email and password passed by the user
  if (!email || !password) {
    throw new CustomError.BadRequestError("please provide email and password");
  }

  //checking if the user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError('Invailed Email or Password')
  }

  //checking if the password is correct 
  const isPasswordCorrect = await user.comparePassword(password)
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invaild Email or Password')
  }

  // checking if the user is verified
  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError('please verifiy your email')
  }

  //signing in the user
  const tokenUser = createTokenUser(user);
  cookiesToResponse({ res, user: tokenUser })

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

// user logout controller
const logout = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: true,
    sameSite: 'none',
  });
  res.status(200).json({ message: 'Successfully logged out' });
};

module.exports = {
  register,
  verfiyEmail,
  login,
  logout,
};
