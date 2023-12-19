const router = require('express').Router();

const { placeOrder, updateOrderStatus, orderDetails, getOrders } = require('../controllers/Order.controller.js');

// Place the order
router.post('/place', placeOrder);

// Update Order Status
router.put('/:orderId', updateOrderStatus);

// Get Order Details
router.get('/:orderId/details', orderDetails);

// Get Orders
router.get('/:userId', getOrders);

module.exports = router;