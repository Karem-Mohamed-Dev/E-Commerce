const { Schema, model } = require("mongoose");

const CouponSchema = new Schema({
    creator: { type: Schema.Types.ObjectId, ref: 'Admin', required: [true, "Creator Id Is Required"] },
    discount: { type: Number, required: [true, "Discount Amount Is Required"], min: 1, max: 100 },
    code: { type: String, required: [true, "Code Is Required"], unique: true },
    expiresAt: { type: Date, required: [true, "Expire Date Is Required"] },
    maxUses: { type: Number, required: [true, "Max Uses Is Required"], min: 1 },
    numOfUses: { type: Number, default: 0 },
}, { timestamps: true })

module.exports = model('Coupon', CouponSchema);