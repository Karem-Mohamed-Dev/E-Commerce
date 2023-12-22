const router = require('express').Router();
const isAuth = require("../utils/isAuth.js");
const isSeller = require("../utils/isSeller.js");
const isUser = require("../utils/isUser.js");

const { search, createProduct, getProduct, editProduct, deleteProduct, reviewProduct, unReviewProduct, productReviews, reportProduct } = require('../controllers/Product.controller.js');

// Search Product
router.get('/search', search);

// Delete Product
router.delete('/:productId', isAuth, isSeller, deleteProduct);

// Review Product
router.post('/:productId/review', isAuth, isUser, reviewProduct);

// Delete Product Review
router.post('/:productId/unreview/:reviewId', isAuth, isUser, unReviewProduct);

// Get Product Reviews
router.get('/:productId/reviews', productReviews);

// Report Product
router.post('/:productId/report', isAuth, isUser, reportProduct);

// Edit Product
router.put('/:productId', isAuth, isSeller, editProduct);

// Get Product
router.get('/:productId', getProduct);

// Create Product
router.post('/', isAuth, isSeller, createProduct);

module.exports = router;