const SubCategory = require('../models/SubCategory');
const Category = require('../models/Category');

// Get SubCategorys
exports.getSubCategorys = async (req, res, next) => {
    const page = +req.params.page || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    try {
        const subCategoriesCount = await SubCategory.countDocuments({});
        const subCategories = await SubCategory.find({})
            .skip(skip).limit(limit);

        res.status(200).json({
            result: subCategoriesCount,
            paginationData: {
                currentPage: page,
                totalPages: Math.ceil(subCategoriesCount / limit)
            },
            subCategories
        })
    } catch (error) { next(error) }
}

// Create SubCategory
exports.createSubCategory = async (req, res, next) => {
    const { categoryId } = req.params;
    const { name } = req.body;
    const file = req.file;
    if (!name || !file) return next(errorModel(400, "Name and Image must be provided"));
    if (!isMongoId(categoryId)) return next(errorModel(400, "Please Provide a Valid Category Id"));

    const slug = name.split(" ").join("-");

    try {
        const category = await Category.findById(categoryId);
        if (!category) return next(errorModel(400, "No Category Found"));

        // Image Upload
        const image = { url: "", publicId: "" }; // Simulation until add image upload

        const subCategory = await SubCategory.create({ name, slug, image, categoryId })
        res.status(200).json({ subCategory: subCategory._doc });
    } catch (error) { next(error) }
}

// Edit SubCategory
exports.editSubCategory = async (req, res, next) => {
    res.send('Edit SubCategory');
}

// Delete SubCategory
exports.deleteSubCategory = async (req, res, next) => {
    res.send('Delete SubCategory');
}