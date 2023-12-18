const router = require('express').Router();

const { login, register, getCode, verifyCode, resetPass } = require('../controllers/Auth.controller.js');

// Login
router.post('/login', login)

// Register
router.post('/register', register)

// Get Reset Password Code
router.post('/get-code', getCode)

// Verify Reset Password Code
router.post('/verify-code', verifyCode)

// Reset Password
router.post('/reset-pass', resetPass)


module.exports = router;