const { Schema, model } = require("mongoose");

const BrandSchema = new Schema({
    name: { type: String, required: [true, "Brand Name Is Required"] },
    slug: { type: String, required: [true, "Slug Is Required"] },
    media: [{ url: { type: String, required: [true, "Url Is Required"] }, publicId: { type: String, required: [true, "Public Id Is Required"] } }],
    creator: { type: Schema.Types.ObjectId, required: [true, "Creator Id Is Required"] },
}, { timestamps: true })

module.exports = model('Brand', BrandSchema);