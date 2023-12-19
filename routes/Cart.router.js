const router = require('express').Router();

const { getCart, addItem, removeItem } = require('../controllers/Cart.controller.js');

// Get Cart
router.get('/:cartId', getCart);

// [ Add || Increse ] Item
router.post('/:cartId/add/:productId', addItem);

// [ Remove || Decrese ] Item
router.post('/:cartId/remove/:productId', removeItem);

module.exports = router;