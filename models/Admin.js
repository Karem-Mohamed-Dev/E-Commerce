const { Schema, model } = require("mongoose");

const AdminSchema = new Schema({
    name: { type: String, required: [true, "Admin Name Is Required"] },
    email: { type: String, required: [true,"Eamil Is Required"] },
    password: { type: String, required: [true, "Password Is Required"] },
    image: { url: { type: String, required: [true, "Url Is Required"], trim: true }, publicId: { type: String, required: [true, "Public Id Is Required"], trim: true } },
    role: { type: String, default: 'admin' },
    resetPass: { code: { type: String, default: null }, expiresAt: { type: Date, default: null } }
}, { timestamps: true })

module.exports = model('Admin', AdminSchema);