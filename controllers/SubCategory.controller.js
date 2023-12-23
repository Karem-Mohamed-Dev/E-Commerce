const SubCategory = require('../models/SubCategory');
const Category = require('../models/Category');
const Product = require('../models/Product');

const { isMongoId } = require("validator");
const errorModel = require("../utils/errorModel");

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
    // const file = req.file;
    // if (!name || !file) return next(errorModel(400, "Name and Image must be provided"));

    const slug = name.split(" ").join("-");
    try {
        const category = await Category.findById(categoryId, ["categoryId", "slug"]);
        if (!category) return next(errorModel(400, "No Category Found"));

        // Image Upload
        const image = { url: "123", publicId: "123" }; // Simulation until add image upload

        const subCategory = await SubCategory.create({ name, slug, image, categoryId })
        res.status(201).json(subCategory);
    } catch (error) { next(error) }
}

// Edit SubCategory
exports.editSubCategory = async (req, res, next) => {
    const { subId } = req.params;
    if (!isMongoId(subId)) return next(errorModel(400, "Please Provide a Valid Category Id"));
    const { name } = req.body;
    const file = req.file;
    if (!file && !name) return next(errorModel(400, "Please Provide at least one field"))

    try {
        const subCategory = await SubCategory.findById(subId);
        if (!subCategory) return next(errorModel(404, "SubCategory not found"));

        if (file) {
            // delete old image
            // upload new image
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
        const subCategory = await SubCategory.findById(subId, 'name');
        if (!subCategory) return next(errorModel(404, "SubCategory not found"));
        await SubCategory.deleteOne();
        await Product.updateMany({ subCategory: subCategory.name }, { subCategory: null });

        res.status(200).json({ msg: "SubCategory deleted successfully" });
    } catch (error) { next(error) }
}