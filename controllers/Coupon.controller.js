const Coupon = require('../models/Coupon');
const { isMongoId } = require("validator");
const errorModel = require('../utils/errorModel');

// Get Coupons
exports.getCoupons = async (req, res, next) => {
    const page = +req.params.page || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    try {
        const couponsCount = await Coupon.countDocuments({});
        const coupones = await Coupon.find({})
            .skip(skip).limit(limit).populate('creator', 'name');

        res.status(200).json({
            result: couponsCount,
            paginationData: {
                currentPage: page,
                totalPages: Math.ceil(couponsCount / limit)
            },
            coupones
        })
    } catch (error) { next(error) }
}

// Get Coupon
exports.getCoupon = async (req, res, next) => {
    const { code } = req.params;
    if (!code) return next(errorModel(400, "Please Provide a code"));

    try {
        const coupon = await Coupon.findOne({ code });
        if (!coupon) return next(errorModel(400, "No Coupon found"));

        if (coupon.expiresAt < Date.now() || coupon.numOfUses >= coupon.maxUses) {
            await coupon.deleteOne();
            return next(errorModel(400, "Coupon Is Expired"));
        }
        res.status(200).json({ discount: coupon.discount });
    } catch (error) { next(error) }
}

// Create Coupon
exports.createCoupon = async (req, res, next) => {
    const { _id, name } = req.admin;
    const { code, discount, expiresAt, maxUses } = req.body;
    if (!code || !discount || !expiresAt || !maxUses) return next(errorModel(400, "Coupon code and discount and expires date and max uses are required"));

    try {
        const coupon = await Coupon.create({ creator: _id, code, discount, expiresAt, maxUses });

        res.status(201).json({ ...coupon._doc, creator: name })
    } catch (error) { next(error) }
}

// Edit Coupon
exports.editCoupon = async (req, res, next) => {
    const { couponId } = req.params;
    if (!isMongoId(couponId)) return next(errorModel(400, "Please provide a valid coupon id"));
    const { code, discount, expiresAt, maxUses } = req.body;
    if (!code && !discount && !expiresAt && !maxUses) return next(errorModel(400, "Please Provide atleast one field"));

    try {
        const coupon = await Coupon.findById(couponId).populate('creator', 'name');

        if (code) coupon.code = code;
        if (discount) coupon.discount = discount;
        if (expiresAt) coupon.expiresAt = expiresAt;
        if (maxUses) coupon.maxUses = maxUses;
        await coupon.save();

        res.status(200).json(coupon)
    } catch (error) { next(error) }
}

// Delete Coupon
exports.deleteCoupon = async (req, res, next) => {
    const { couponId } = req.params;
    if (!isMongoId(couponId)) return next(errorModel(400, "Please provide a valid coupon id"));

    try {
        const coupon = await Coupon.findById(couponId).populate('creator', 'name');
        if(!coupon) return next(errorModel(404, "Coupon not found"));
        await coupon.deleteOne();
        res.status(200).json({ msg: "Coupon deleted successfully" })
    } catch (error) { next(error) }
}