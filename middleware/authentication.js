const CustomError = require('../errors')
const {isTokenValid} = require('../utils')



const authenticateUser = async (req,res,next) => {
    const token = req.signedCookies.token;
    
    //checking if the token exists
    if(!token){
       throw new CustomError.UnauthenticatedError('Authentication Invalid')
    }
    
    //authenticating the user
    try {
        const {name,lastName,userId,role} = isTokenValid({ token })
        req.user = {name,lastName,userId,role};
        next()
    } catch (error) {
        throw new CustomError.UnauthenticatedError('Authentication Invalid')
    }
}

const authorizePermissions = (...roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            throw new CustomError.UnauthorizedError('Unauthorized to access this route')
        }
        next();
    }
}


module.exports = {
    authenticateUser,
    authorizePermissions,
}