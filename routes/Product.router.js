const router = require('express').Router();

const { search, createProduct, getProduct, editProduct, deleteProduct, reviewProduct, productReviews, reportProduct } = require('../controllers/Product.controller.js');

// Search Product
router.get('/search', search);

// Delete Product
router.delete('/:productId', deleteProduct);

// Review Product
router.post('/:productId/review', reviewProduct);

// Get Product Reviews
router.get('/:productId/reviews', productReviews);

// Report Product
router.post('/report', reportProduct);

// Edit Product
router.put('/:productId', editProduct);

// Get Product
router.get('/:productId', getProduct);

// Create Product
router.post('/', createProduct);

module.exports = router;