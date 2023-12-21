const Category = require('../models/Category');
const Product = require('../models/Product');

// Get Categorys
exports.getCategorys = async (req, res, next) => {
    const page = +req.params.page || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    try {
        const categoriesCount = await Brand.countDocuments({});
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
    const file = req.file;
    if (!name || !file) return next(errorModel(400, "Name and Image must be provided"));

    const slug = name.split(" ").join("-");
    try {
        // Image Upload
        const image = { url: "", publicId: "" }; // Simulation until add image upload

        const category = await Category.create({ name, slug, image });

        res.status(200).json({ category: category._doc });
    } catch (error) { next(error) }
}

// Edit Category
exports.editCategory = async (req, res, next) => {
    const { categoryId } = req.params;
    const { name } = req.body;
    const file = req.file;
    if (!name && !file) return next(errorModel(400, "Name or Image must be provided"));
    if (!isMongoId(categoryId)) return next(errorModel(400, "Please Provide a Valid Category Id"));

    try {
        const category = await Category.findById(categoryId);

        if (file) {
            // Current Image Delete
            // Image Upload
            const image = { url: "", publicId: "" }; // Simulation until add image upload
            category.image = image;
        }
        if (name) category.name = name;

        await category.save();
        res.status(200).json({ category: category._doc });
    } catch (error) { next(error) }
}

// Delete Category
exports.deleteCategory = async (req, res, next) => {
    const { categoryId } = req.params;
    if (!isMongoId(categoryId)) return next(errorModel(400, "Please Provide a Valid Category Id"));

    try {
        const category = await Category.findById(categoryId);
        if (!category) return next(errorModel(400, "Category not found"));

        // image delete ...

        await Product.updateMany({ category: category.name }, { category: null });
        await category.deleteOne();

        res.status(200).json({ msg: "Category deleted successfully" });
    } catch (error) { next(error) }
}