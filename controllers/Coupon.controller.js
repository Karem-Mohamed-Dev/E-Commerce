const Coupone = require('../models/Coupon');
const { isMongoId } = require("validator");
const errorModel = require('../utils/errorModel');
// Get Coupons
exports.getCoupons = async (req, res, next) => {
    const page = +req.params.page || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    try {
        const couponsCount = await Coupone.countDocuments({});
        const coupones = await Coupone.find({})
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
        const coupone = await Coupone.findOne({ code });
        if (!coupone) return next(errorModel(400, "No Coupon found"));

        if (coupone.expiresAt > Date.now()) return next(errorModel(400, "Coupon Is Expired"));
        if (coupone.numOfUses >= coupone.maxUses) {
            await coupone.deleteOne();
            return next(errorModel(400, "Coupon Reatched maximum usage"));
        }
        res.status(200).json(coupone.discount);
    } catch (error) { next(error) }
}

// Create Coupon
exports.createCoupon = async (req, res, next) => {
    const { _id, name } = req.admin;
    const { code, discount, expiresAt, maxUses } = req.body;
    if (!code || !discount || !expiresAt || !maxUses) return next(errorModel(400, "Coupon code and discount and expires date and max uses are required"));

    try {
        const coupone = await Coupone.create({ creator: _id, code, discount, expiresAt, maxUses });

        res.status(201).json({ ...coupone, creator: name })
    } catch (error) { next(error) }
}

// Edit Coupon
exports.editCoupon = async (req, res, next) => {
    const { couponId } = req.params;
    if(!isMongoId(couponId)) return next(errorModel(400, "Please provide a valid coupon id")); 
    const { code, discount, expiresAt, maxUses } = req.body;
    if (!code && !discount && !expiresAt && !maxUses) return next(errorModel(400, "Please Provide atleast one field"));

    try {
        const coupon = await Coupone.findById(couponId).populate('creator', 'name');

        if(code) coupon.code = code;
        if(discount) coupon.discount = discount;
        if(expiresAt) coupon.expiresAt = expiresAt;
        if(maxUses) coupon.maxUses = maxUses;
        await coupon.save();

        res.status(200).json(coupon)
    } catch (error) { next(error) }
}

// Delete Coupon
exports.deleteCoupon = async (req, res, next) => {
    const { couponId } = req.params;
    if(!isMongoId(couponId)) return next(errorModel(400, "Please provide a valid coupon id"));

    try {
        const coupon = await Coupone.findById(couponId).populate('creator', 'name');
        await coupon.deleteOne();
        res.status(200).json({msg: "Coupon deleted successfully"})
    } catch (error) { next(error) }
}