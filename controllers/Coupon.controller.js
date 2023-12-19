const Coupone = require('../models/Coupon');
const Admin = require("../models/Admin");

// Get Coupons
exports.getCoupons = async (req, res, next) => {
    res.send('Get Coupons');
}

// Create Coupon
exports.createCoupon = async (req, res, next) => {
    res.send('Create Coupon');
}

// Edit Coupon
exports.editCoupon = async (req, res, next) => {
    res.send('Edit Coupon');
}

// Delete Coupon
exports.deleteCoupon = async (req, res, next) => {
    res.send('Delete Coupon');
}