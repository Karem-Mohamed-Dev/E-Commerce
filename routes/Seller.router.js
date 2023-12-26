const router = require('express').Router();
const isSeller = require('../utils/isSeller.js');
const isAuth = require('../utils/isAuth.js');
const { upload } = require("../utils/upload.js");

const { login, register, changePassword, updateSeller, deleteSeller, getSellerProducts, getSeller } = require('../controllers/Seller.controller.js');

// Login
router.post('/login', login);

// Register
router.post('/register', register);

// Change Password
router.post('/change-pass', isAuth, isSeller, changePassword);

// Update Seller
router.put('/', isAuth, isSeller, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'background', maxCount: 1 }]), updateSeller);

// Delete Seller
router.delete('/', isAuth, isSeller, deleteSeller);

// Get Products
router.get('/:sellerId/products', getSellerProducts);

// Get Seller
router.get('/:sellerId', getSeller);

module.exports = router;