const router = require('express').Router();
const isSeller = require('../utils/isSeller.js');

const { login, register, changePassword, updateUser, deleteUser, getUserProducts, getUser } = require('../controllers/Seller.controller.js');

// Login
router.post('/login', login);

// Register
router.post('/register', register);

// Change Password
router.post('/change-pass', isSeller, changePassword);

// Update User
router.put('/', isSeller, updateUser);

// Delete User
router.delete('/', isSeller, deleteUser);

// Get Products
router.get('/:userId/products', getUserProducts);

// Get User
router.get('/:userId', getUser);

module.exports = router;