const { Schema, model } = require("mongoose");

const ReviewSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: [true, "User Id Is Required"] },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: [true, "Product Id Is Required"] },
    comment: { type: String, default: null, trim: true },
    rating: { type: Number, required: [true, "Rating Is Required"], min: 0, max: 5 }
}, { timestamps: true })

module.exports = model('Review', ReviewSchema);