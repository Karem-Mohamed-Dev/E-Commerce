const router = require('express').Router();

const { getCoupons, createCoupon, editCoupon, deleteCoupon } = require('../controllers/Coupon.controller.js');

// Edit Coupon
router.put('/:couponId', editCoupon);

// Delete Coupon
router.delete('/:couponId', deleteCoupon);

// Create Coupon
router.post('/', createCoupon);

// Get All Coupons
router.get('/', getCoupons);

module.exports = router;