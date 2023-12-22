const Product = require("../models/Product");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const Brand = require("../models/Brand");

const { isMongoId } = require("validator");
const errorModel = require("../utils/errorModel");

// Search
exports.search = async (req, res, next) => {
    res.send("Search");
}

// Create Product
exports.createProduct = async (req, res, next) => {
    const { _id } = req.seller;
    const { title, description, category, subCategory, price, brand, stock, discount } = req.body;
    const files = req.files;

    if (!title || !description || !category || !price || files.length === 0) return next(errorModel(400, "title, description, category, price and product images are required"));
    if (!isMongoId(category)) return next(errorModel(400, "Category Id Is Invalid"));

    try {
        const data = {};
        if (subCategory) {
            if (!isMongoId(subCategory)) return next(errorModel(400, "SubCategory Id Is Invalid"));
            const subCat = await SubCategory.findById(subCategory);
            if (!subCat) return next(errorModel(400, "SubCategory not Found"));
            data.subCategory = subCat.name;
        }
        if (brand) {
            if (!isMongoId(brand)) return next(errorModel(400, "Brand Id Is Invalid"));
            const brandData = await Brand.findById(brand);
            if (!brandData) return next(errorModel(400, "Brand not Found"));
            data.brand = brandData.name;
        }

        if (stock) data.stock = stock;
        if (discount) data.discount = discount;

        const categoryData = await Category.findById(category);
        if (!categoryData) return next(errorModel(400, "Category not Found"));

        // image uploda
        const media = [{ url: "", publicId: "" }] // Simulation until add image upload

        const product = await Product.create({ seller: _id, title, description, category: categoryData.name, price, media, ...data })

        res.status(200).json(product)
    } catch (error) { next(error) }
}

// Get Product
exports.getProduct = async (req, res, next) => {
    res.send("Get Product");
}

// Edit Product
exports.editProduct = async (req, res, next) => {
    res.send("Edit Product");
}

// Delete Product
exports.deleteProduct = async (req, res, next) => {
    res.send("Delete Product");
}

// Review Product
exports.reviewProduct = async (req, res, next) => {
    res.send("Review Product");
}

// Get Product Reviews
exports.productReviews = async (req, res, next) => {
    res.send("Product Reviews");
}

// Report Product
exports.reportProduct = async (req, res, next) => {
    res.send("Report Product");
}
