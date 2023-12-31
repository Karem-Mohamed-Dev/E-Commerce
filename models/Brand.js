const { Schema, model } = require("mongoose");

const BrandSchema = new Schema({
    name: { type: String, required: [true, "Brand Name Is Required"], unique: true },
    slug: { type: String, required: [true, "Slug Is Required"] },
    image: { url: { type: String, required: [true, "Url Is Required"] }, publicId: { type: String, required: [true, "Public Id Is Required"] } },
    products: { type: Number, default: 0 }
}, { timestamps: true })

module.exports = model('Brand', BrandSchema);