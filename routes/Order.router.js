const router = require('express').Router();
const isAuth = require('../utils/isAuth');
const isUser = require('../utils/isUser');
const isAdmin = require('../utils/isAdmin');

const { placeOrder, updateOrderStatus, orderDetails, getOrders } = require('../controllers/Order.controller.js');

router.use(isAuth);

// Place the order
router.post('/', isUser, placeOrder);

// Update Order Status
router.put('/:orderId', isAdmin, updateOrderStatus);

// Get Order Details
router.get('/:orderId/details', isUser, orderDetails);

// Get Orders
router.get('/:userId', isUser, getOrders);

module.exports = router;