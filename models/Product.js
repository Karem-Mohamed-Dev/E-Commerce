const { Schema, model } = require("mongoose");

const ProductSchema = new Schema({
    title: { type: String, require: [true, "Product Title Is Required"] },
    description: { type: String, require: [true, "Product Description Is Required"] },
    media: [{ url: { type: String, required: [true, "Url Is Required"] }, publicId: { type: String, required: [true, "Public Id Is Required"] } }],
    category: { type: Schema.Types.ObjectId, required: [true, "Category Is Required"] },
    subCategory: { type: Schema.Types.ObjectId, default: null },
    price: { type: Number, required: [true, "Product Price Is Required"], min: 0 },
    brand: { type: Schema.Types.ObjectId, ref: "Brand", default: null },
    stock: { type: Number, default: 0 },
    favorited: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    seller: { type: Schema.Types.ObjectId, ref: 'Seller', required: [true, "Seller Id Is Required"] },
    reviews: { type: Number, default: 0 }
}, { timestamps: true })

module.exports = model('Product', ProductSchema);