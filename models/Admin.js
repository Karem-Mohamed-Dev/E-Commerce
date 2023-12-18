const { Schema, model } = require("mongoose");

const AdminSchema = new Schema({
    name: { type: String, required: [true, "Admin Name Is Required"] },
    email: { type: String, required: [true,"Eamil Is Required"] },
    password: { type: String, required: [true, "Password Is Required"] },
    role: { type: String, default: 'admin' },
    resetPass: { code: { tytpe: String, default: null }, expiresAt: { type: Date, default: null } }
}, { timestamps: true })

module.exports = model('Admin', AdminSchema);