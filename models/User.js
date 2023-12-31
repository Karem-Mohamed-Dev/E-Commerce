const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
    name: { type: String, required: [true, "User Name Is Required"], trim: true },
    email: { type: String, required: [true, "Email Is Required"], unique: true, trim: true },
    password: { type: String, required: [true, "Paasword Is Required"], trim: true },
    image: { url: { type: String, default: null }, publicId: { type: String, default: null } },
    activated: { type: Boolean, default: false },
    phone: { type: Number, default: null },
    address: {
        country: { type: String, default: null, trim: true },
        city: { type: String, default: null, trim: true },
        postCode: { type: Number, default: null },
    },
    role: { type: String, default: 'user' },
    ban: { type: Boolean, default: false },
    favorites: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
    resetPass: { code: { type: String, default: null }, expiresAt: { type: Date, default: null } }
}, { timestamps: true })

module.exports = model('User', UserSchema);