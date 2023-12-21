const router = require('express').Router();

const { login, register, changePassword, updateUser, deleteUser, getUser, getFavorits, addFavorite } = require('../controllers/User.controller.js');

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

// Get User
router.get('/:userId', getUser);

// Get Favorits
router.get('/favorits', getFavorits);

// Add Product To Favorits
router.post('/favorits', addFavorite);

module.exports = router;