const { Schema, model } = require("mongoose");

const OrderSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: [true, "User Id Is Required"] },
    products: [{
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, min: 1 }
    }],
    phone: { type: Number, required: [true, "Phone Number Is Required"] },
    address: {
        country: { type: String, required: [true, "Country Is Required"] },
        city: { type: String, required: [true, "City Is Required"] },
        postCode: { type: Number, required: [true, "Post Code Is Required"] },
    },
    coupon: { code: { type: String, default: null }, discount: { type: Number, default: null } },
    payment: {
        type: String,
        enum: ["cash", "card"],
        required: [true, "Payment Method Is Required"]
    },
    status: {
        type: String,
        enum: ['Pending', 'Placed', 'Delivered', 'Canceled'],
        default: 'Pending'
    },
    total: { type: Number, required: [true, "Total Is Required"] },
}, { timestamps: true })

module.exports = model('Order', OrderSchema);