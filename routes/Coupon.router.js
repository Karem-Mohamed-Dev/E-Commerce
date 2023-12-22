const router = require('express').Router();
const isAdmin = require("../utils/isAdmin.js");
const isAuth = require("../utils/isAuth.js");

const { getCoupons, getCoupon, createCoupon, editCoupon, deleteCoupon } = require('../controllers/Coupon.controller.js');

// Get Coupon
router.get('/:code', getCoupon);

// Admin Route Protection
router.use(isAuth, isAdmin);

// ----------------------------------------------------------------

// Get All Coupons
router.get('/', getCoupons);

// Edit Coupon
router.put('/:couponId', editCoupon);

// Delete Coupon
router.delete('/:couponId', deleteCoupon);

// Create Coupon
router.post('/', createCoupon);

module.exports = router;