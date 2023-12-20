const router = require('express').Router();

const { verifyAccount, getCode, verifyCode, resetPass } = require('../controllers/Auth.controller.js');


// Verify Account
router.get('/verify/:token', verifyAccount);

// Get Reset Password Code
router.post('/get-code', getCode)

// Verify Reset Password Code
router.post('/verify-code', verifyCode)

// Reset Password
router.post('/reset-pass', resetPass)


module.exports = router;