const router = require('express').Router();

const { login, register, changePassword, updateUser, deleteUser, getUserProducts, getUser } = require('../controllers/Seller.controller.js');

// Login
router.post('/login', login);

// Register
router.post('/register', register);

// Change Password
router.post('/change-pass', changePassword);

// Update User
router.put('/:userId', updateUser);

// Delete User
router.delete('/:userId', deleteUser);

// Get Products
router.get('/:userId/products', getUserProducts);

// Get User
router.get('/:userId', getUser);

module.exports = router;