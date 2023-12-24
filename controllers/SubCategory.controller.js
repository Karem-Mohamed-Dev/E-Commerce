const SubCategory = require('../models/SubCategory');
const Category = require('../models/Category');
const Product = require('../models/Product');

const { isMongoId } = require("validator");
const errorModel = require("../utils/errorModel");
const { cloudinary } = require("../utils/upload")

// Get SubCategorys
exports.getSubCategorys = async (req, res, next) => {
    const { categoryId } = req.params;

    try {
        const subCategories = await SubCategory.find({ categoryId }, ['-slug', '-categoryId']);
        res.status(200).json(subCategories);
    } catch (error) { next(error) }
}

// Create SubCategory
exports.createSubCategory = async (req, res, next) => {
    const { categoryId } = req.params;
    if (!isMongoId(categoryId)) return next(errorModel(400, "Please Provide a Valid Category Id"));
    const { name } = req.body;
    const file = req.file ? req.file.path : null;
    if (!name || !file) return next(errorModel(400, "Name and Image must be provided"));

    const slug = name.split(" ").join("-");
    try {
        const category = await Category.findById(categoryId);
        if (!category) return next(errorModel(400, "No Category Found"));

        const result = await cloudinary.uploader.upload(file, { folder: 'subCategory_image' })
        const image = {
            url: result.secure_url,
            publicId: result.public_id
        }

        const subCategory = await SubCategory.create({ name, slug, image, categoryId })
        res.status(201).json(subCategory);
    } catch (error) { next(error) }
}

// Edit SubCategory
exports.editSubCategory = async (req, res, next) => {
    const { subId } = req.params;
    if (!isMongoId(subId)) return next(errorModel(400, "Please Provide a Valid Category Id"));
    const { name } = req.body;
    const file = req.file ? req.file.path : null;
    if (!file && !name) return next(errorModel(400, "Please Provide at least one field"))

    try {
        const subCategory = await SubCategory.findById(subId);
        if (!subCategory) return next(errorModel(404, "SubCategory not found"));

        if (file) {
            if (subCategory.image.publicId)
                await cloudinary.uploader.destroy(subCategory.image.publicId)
            const result = await cloudinary.uploader.upload(file, { folder: 'subCategory_image' })
            subCategory.image.url = result.secure_url;
            subCategory.image.publicId = result.public_id;
        }
        if (name) {
            await Product.updateMany({ subCategory: subCategory.name }, { subCategory: name });
            subCategory.name = name;
            subCategory.slug = name.split(" ").join("-");
        }
        await subCategory.save();

        res.status(200).json(subCategory);
    } catch (error) { next(error) }
}

// Delete SubCategory
exports.deleteSubCategory = async (req, res, next) => {
    const { subId } = req.params;
    if (!isMongoId(subId)) return next(errorModel(400, "Please Provide a Valid Category Id"));

    try {
        const subCategory = await SubCategory.findById(subId, ['name', 'image']);
        if (!subCategory) return next(errorModel(404, "SubCategory not found"));

        if (subCategory.image.publicId) await cloudinary.uploader.destroy(subCategory.image.publicId)
        await Product.updateMany({ subCategory: subCategory.name }, { subCategory: null });
        await SubCategory.deleteOne();

        res.status(200).json({ msg: "SubCategory deleted successfully" });
    } catch (error) { next(error) }
}