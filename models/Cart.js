const { Schema, model } = require("mongoose");

const CartSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: [true, "User Id Is Required"] },
    products: [{
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 }
    }]
})

module.exports = model('Cart', CartSchema);