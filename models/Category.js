const { Schema, model } = require("mongoose");

const CategorySchema = new Schema({
    name: { type: String, required: [true, "Category Name Is Required"], unique: true },
    slug: { type: String, required: [true, "Slug Is Required"] },
    image: { url: { type: String, required: [true, "Url Is Required"] }, publicId: { type: String, required: [true, "Public Id Is Required"] } },
    creator: { type: Schema.Types.ObjectId, ref: 'Admin', required: [true, "Creator Id Is Required"] }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
})

CategorySchema.virtual('SubCategory', {
    ref: 'SubCategory',
    localField: '_id',
    foreignField: 'categoryId'
})

module.exports = model('Category', CategorySchema);