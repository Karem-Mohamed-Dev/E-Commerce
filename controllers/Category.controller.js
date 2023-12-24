const Category = require('../models/Category');
const Product = require('../models/Product');

const errorModel = require('../utils/errorModel');
const { isMongoId } = require("validator");
const { cloudinary } = require('../utils/upload');

// Get Categorys
exports.getCategorys = async (req, res, next) => {
    const page = +req.params.page || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    try {
        const categoriesCount = await Category.countDocuments({});
        const categories = await Category.find({})
            .skip(skip).limit(limit);

        res.status(200).json({
            result: categoriesCount,
            paginationData: {
                currentPage: page,
                totalPages: Math.ceil(categoriesCount / limit)
            },
            categories
        })
    } catch (error) { next(error) }
}

// Create Category
exports.createCategory = async (req, res, next) => {
    const { name } = req.body;
    const file = req.file ? req.file.path : null;
    if (!name || !file) return next(errorModel(400, "Name and Image must be provided"));

    try {
        const slug = name.split(" ").join("-");
        const { secure_url, public_id } = await cloudinary.uploader.upload(file, { folder: 'category_images' });
        const image = { url: secure_url, publicId: public_id }
        const category = await Category.create({ name, slug, image });

        res.status(201).json(category);
    } catch (error) { next(error) }
}

// Edit Category
exports.editCategory = async (req, res, next) => {
    const { categoryId } = req.params;
    if (!isMongoId(categoryId)) return next(errorModel(400, "Please Provide a Valid Category Id"));
    const { name } = req.body;
    const file = req.file ? req.file.path : null;
    if (!name && !file) return next(errorModel(400, "Name or Image must be provided"));

    try {
        const category = await Category.findById(categoryId);
        if (!category) return next(errorModel(400, "Category not found"));

        if (name) {
            await Product.updateMany({ category: category.name }, { category: name });
            category.name = name;
            category.slug = name.split(" ").join("-");
        }
        if (file) {
            await cloudinary.uploader.destroy(category.image.publicId)
            const { secure_url, public_id } = await cloudinary.uploader.upload(file, { folder: 'category_images' })
            category.image = { url: secure_url, publicId: public_id };
        }
        await category.save();

        res.status(200).json(category);
    } catch (error) { next(error) }
}

// Delete Category
exports.deleteCategory = async (req, res, next) => {
    const { categoryId } = req.params;
    if (!isMongoId(categoryId)) return next(errorModel(400, "Please Provide a Valid Category Id"));

    try {
        const category = await Category.findById(categoryId);
        if (!category) return next(errorModel(400, "Category not found"));

        await Product.updateMany({ category: category.name }, { category: null });
        await cloudinary.uploader.destroy(category.image.publicId);
        await category.deleteOne();

        res.status(200).json({ msg: "Category deleted successfully" });
    } catch (error) { next(error) }
}