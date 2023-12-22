const router = require('express').Router();
const isAuth = require("../utils/isAuth.js");
const isSeller = require("../utils/isSeller.js");

const { search, createProduct, getProduct, editProduct, deleteProduct, reviewProduct, productReviews, reportProduct } = require('../controllers/Product.controller.js');

// Search Product
router.get('/search', search);

// Delete Product
router.delete('/:productId', isAuth, isSeller, deleteProduct);

// Review Product
router.post('/:productId/review', isAuth, reviewProduct);

// Get Product Reviews
router.get('/:productId/reviews', productReviews);

// Report Product
router.post('/:productId/report', isAuth, reportProduct);

// Edit Product
router.put('/:productId', isAuth, isSeller, editProduct);

// Get Product
router.get('/:productId', getProduct);

// Create Product
router.post('/', isAuth, isSeller, createProduct);

module.exports = router;