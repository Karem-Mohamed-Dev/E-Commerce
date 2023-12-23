const router = require('express').Router();
const isAuth = require('../utils/isAuth');
const isUser = require('../utils/isUser');

const { login, register, changePassword, updateUser, deleteUser, getUser, getFavorites, removeFavorite, addFavorite } = require('../controllers/User.controller.js');

// Login
router.post('/login', login);

// Register
router.post('/register', register);

// Change Password
router.post('/change-pass', isAuth, isUser, changePassword);

// Update User
router.put('/', isAuth, isUser, updateUser);

// Get Favorites
router.get('/favorites', isAuth, isUser, getFavorites);

// Add Product To Favorites
router.post('/favorite/:productId', isAuth, isUser, addFavorite);

// Remove Product From Favorites
router.post('/unfavorite/:productId', isAuth, isUser, removeFavorite);

// Delete User
router.delete('/', isAuth, isUser, deleteUser);

// Get User
router.get('/:userId', getUser);

module.exports = router;