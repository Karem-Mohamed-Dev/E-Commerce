const router = require('express').Router();
const isSeller = require('../utils/isSeller.js');

const { login, register, changePassword, updateSeller, deleteSeller, getSellerProducts, getSeller } = require('../controllers/Seller.controller.js');

// Login
router.post('/login', login);

// Register
router.post('/register', register);

// Change Password
router.post('/change-pass', isSeller, changePassword);

// Update Seller
router.put('/', isSeller, updateSeller);

// Delete Seller
router.delete('/', isSeller, deleteSeller);

// Get Products
router.get('/:sellerId/products', getSellerProducts);

// Get Seller
router.get('/:sellerId', getSeller);

module.exports = router;