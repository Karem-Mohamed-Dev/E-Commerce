const { Schema, model } = require("mongoose");

const CategorySchema = new Schema({
    name: { type: String, required: [true, "Category Name Is Required"], unique: true },
    slug: { type: String, required: [true, "Slug Is Required"] },
    image: { url: { type: String, required: [true, "Url Is Required"] }, publicId: { type: String, required: [true, "Public Id Is Required"] } },
    products: { type: Number, default: 0 }
}, { timestamps: true })

module.exports = model('Category', CategorySchema);