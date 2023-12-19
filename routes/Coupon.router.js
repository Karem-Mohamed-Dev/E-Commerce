const router = require('express').Router();

const { getCoupons, getCoupon, createCoupon, editCoupon, deleteCoupon } = require('../controllers/Coupon.controller.js');

// Edit Coupon
router.put('/:couponId', editCoupon);

// Delete Coupon
router.delete('/:couponId', deleteCoupon);

// Create Coupon
router.post('/', createCoupon);

// Get Coupon
router.get('/:code', getCoupon);

// Get All Coupons
router.get('/', getCoupons);

module.exports = router;