const createTokenUser = (user) => {
  return {
    name: user.name,
    lastName: user.lastName,
    userId: user._id,
    email: user.email,
    role: user.role,
  };
};

module.exports = createTokenUser;
