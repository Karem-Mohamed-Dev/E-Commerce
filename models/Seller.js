const { Schema, model } = require("mongoose");

const SellerSchema = new Schema({
    name: { type: String, required: [true, "User Name Is Required"], trim: true },
    email: { type: String, required: [true, "Email Is Required"], trim: true },
    password: { type: String, required: [true, "Paasword Is Required"], trim: true },
    bio: { type: String, default: null, trim: true },
    image: { url: { type: String, default: null }, publicId: { type: String, default: null } },
    backgroundImage: { url: { type: String, default: null }, publicId: { type: String, default: null } },
    activated: { type: Boolean, default: false },
    phone: { type: Number, default: null },
    address: {
        country: { type: String, default: null, trim: true },
        city: { type: String, default: null, trim: true },
        postCode: { type: Number, default: null },
    },
    role: { type: String, default: 'seller' },
    ban: { type: Boolean, default: false },
    warnings: {type: Number, default: 0},
    balance: { type: Number, default: 0 },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    resetPass: { code: { type: String, default: null }, expiresAt: { type: Date, default: null } }
}, { timestamps: true })

module.exports = model('Seller', SellerSchema);