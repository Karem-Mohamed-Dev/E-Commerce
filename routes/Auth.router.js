const router = require('express').Router();

const { verifyAccount, getUserCode, verifyUserCode, resetUserPass, getSellerCode, verifySellerCode, resetSellerPass } = require('../controllers/Auth.controller.js');


// Verify Account
router.get('/verify/:token', verifyAccount);

// ----------------------------------------------------------------

// Get Reset Password Code For User
router.post('/user/get-code', getUserCode)

// Verify Reset Password Code For User
router.post('/user/verify-code', verifyUserCode)

// Reset Password For User
router.post('/user/reset-pass', resetUserPass)

// ----------------------------------------------------------------

// Get Reset Password Code For Seller
router.post('/seller/get-code', getSellerCode)

// Verify Reset Password Code For Seller
router.post('/seller/verify-code', verifySellerCode)

// Reset Password For Seller
router.post('/seller/reset-pass', resetSellerPass)


module.exports = router;