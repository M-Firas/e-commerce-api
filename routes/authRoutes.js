const express = require("express");
const router = express.Router();

const { register, login, logout, verfiyEmail } = require("../controllers/authController");


router.post('/register', register)
router.post('/verify-email', verfiyEmail)
router.post('/login', login)
router.get('/logout', logout)

module.exports = router;