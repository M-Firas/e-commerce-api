const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {createTokenUser,cookiesToResponse,checkPermissions} = require('../utils')

//getting all users
const getAllUsers = async (req, res) => {
  console.log(req.user);
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};

//getting Single user
const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select("-password");

  //checks if the user exists
  if (!user) {
    throw new CustomError.NotFoundError(
      `no user exists with id : ${req.params.id}`
    );
  }
  checkPermissions(req.user,user._id)
  res.status(StatusCodes.OK).json({ user });
};

//getting current user
const getCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

//updating user
// const updateUser = async (req, res) => {
//   const { email, name, lastName } = req.body;
//   if (!email || !name || !lastName) {
//     throw new CustomError.BadRequestError("Please provide all values");
//   }

//   const user = await User.findOneAndUpdate(
//     { _id: req.user.userId },
//     { email, name, lastName },
//     { new: true, runValidators: true }
//   );

//   const tokenUser = createTokenUser(user);
//   cookiesToResponse({res,user:tokenUser})
//   res.status(StatusCodes.OK).json({user:tokenUser});
// };

//updating user with user.save()
const updateUser = async (req, res) => {
  const { email, name, lastName } = req.body;
  if (!email || !name || !lastName) {
    throw new CustomError.BadRequestError("Please provide all values");
  }

 const user = await User.findOne({_id: req.user.userId})
 user.email = email;
 user.name = name;
 user.lastName = lastName;

 await user.save();

  const tokenUser = createTokenUser(user);
  cookiesToResponse({res,user:tokenUser})
  res.status(StatusCodes.OK).json({user:tokenUser});
};

//updating user password
const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // checks if the passwords are entered by the user
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError("Please enter both passwords");
  }

  const user = await User.findOne({ _id: req.user.userId });

  // checks if the password is correct
  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("incorrect password");
  }

  user.password = newPassword;

  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Password updated Successfully" });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  getCurrentUser,
  updateUser,
  updateUserPassword,
};
