const router = require('express').Router();
const isAuth = require('../utils/isAuth');
const isUser = require('../utils/isUser');

const { getCart, addItem, removeItem } = require('../controllers/Cart.controller.js');

router.use(isAuth, isUser);

// Get Cart
router.get('/', getCart);

// [ Add || Increse ] Item
router.post('/add/:productId', addItem);

// [ Remove || Decrese ] Item
router.post('/remove/:productId', removeItem);

module.exports = router;