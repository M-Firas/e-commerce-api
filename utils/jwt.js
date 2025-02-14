const jwt = require('jsonwebtoken');

const createJWT = ({ payload }) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET)
    return token;
}

const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET)

const cookiesToResponse = ({ res, user, refreshToken }) => {
    const accessTokenJWT = createJWT({ payload: { user } })
    const refreshTokenJWT = createJWT({ payload: { user, refreshToken } })

    const oneDay = 1000 * 60 * 60 * 24;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;

    res.cookie('accessToken', accessTokenJWT, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        signed: true,
        expires: new Date(Date.now() + oneDay),
    })

    res.cookie('refreshToken', refreshTokenJWT, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        signed: true,
        expires: new Date(Date.now() + oneWeek),
    })
}


module.exports = {
    createJWT,
    isTokenValid,
    cookiesToResponse
}