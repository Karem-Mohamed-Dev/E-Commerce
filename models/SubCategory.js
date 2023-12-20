const { Schema, model } = require("mongoose");

const SubCategorySchema = new Schema({
    name: { type: String, required: [true, "SubCategory Name Is Required"], unique: true, trim: true },
    slug: { type: String, required: [true, "Slug Is Required"], trim: true },
    image: { url: { type: String, required: [true, "Url Is Required"], trim: true }, publicId: { type: String, required: [true, "Public Id Is Required"], trim: true } },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: [true, "Category Id Is Required"] },
    products: { type: Number, default: 0 },
    creator: { type: Schema.Types.ObjectId, ref: 'Admin', required: [true, "Creator Id Is Required"] }
}, { timestamps: true })

module.exports = model('SubCategory', SubCategorySchema);