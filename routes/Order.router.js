const router = require('express').Router();
const isAuth = require('../utils/isAuth');
const isUser = require('../utils/isUser');

const { placeOrder, updateOrderStatus, orderDetails, getOrders } = require('../controllers/Order.controller.js');

router.use(isAuth, isUser);

// Place the order
router.post('/', placeOrder);

// Update Order Status
router.put('/:orderId', updateOrderStatus);

// Get Order Details
router.get('/:orderId/details', orderDetails);

// Get Orders
router.get('/:userId', getOrders);

module.exports = router;