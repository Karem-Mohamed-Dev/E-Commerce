const Product = require("../models/Product");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const Brand = require("../models/Brand");
const Review = require("../models/Review");

const { isMongoId } = require("validator");
const errorModel = require("../utils/errorModel");
const Report = require("../models/Report");

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

        res.status(201).json(product)
    } catch (error) { next(error) }
}

// Get Product
exports.getProduct = async (req, res, next) => {
    const { productId } = req.params;
    if (!isMongoId(productId)) return next(errorModel(400, "Product Id Is Invalid"));

    try {
        const product = await Product.findById(productId, ["-favorited", "-sold"])
            .populate("seller", ["name", "image"]);
        if (!product) return next(errorModel(400, "Product not found"));

        res.status(200).json(product);
    } catch (error) { next(error) }
}

// Edit Product
exports.editProduct = async (req, res, next) => {
    const { productId } = req.params;
    const { title, description, category, subCategory, price, brand, stock, discount } = req.body;
    const files = req.files;

    if (files.length === 0 && Object.keys(req.body).length === 0) return next(errorModel(400, "Provide at least one field"));
    if (!isMongoId(productId)) return next(errorModel(400, "Product Id Is Invalid"));

    try {
        const product = await Product.findById(productId, ["-favorited", "-sold"])
            .populate("seller", ["name", "image"]);
        if (!product) return next(errorModel(400, "Product not found"));

        if (category) {
            const categoryData = await Category.findById(category);
            if (!categoryData) return next(errorModel(400, "Category not Found"));
            product.category = categoryData;
        }
        if (subCategory) {
            if (!isMongoId(subCategory)) return next(errorModel(400, "SubCategory Id Is Invalid"));
            const subCat = await SubCategory.findById(subCategory);
            if (!subCat) return next(errorModel(400, "SubCategory not Found"));
            product.subCategory = subCat.name;
        }
        if (brand) {
            if (!isMongoId(brand)) return next(errorModel(400, "Brand Id Is Invalid"));
            const brandData = await Brand.findById(brand);
            if (!brandData) return next(errorModel(400, "Brand not Found"));
            product.brand = brandData.name;
        }
        if (title) product.title = title;
        if (description) product.description = description;
        if (price) product.price = price;
        if (stock) product.stock = stock;
        if (discount) product.discount = discount;
        const updatedProduct = await product.save();

        res.status(200).json(updatedProduct._doc);
    } catch (error) { next(error) }
}

// Delete Product
exports.deleteProduct = async (req, res, next) => {
    const { productId } = req.params;
    if (!isMongoId(productId)) return next(errorModel(400, "Product Id Is Invalid"));

    try {
        const product = await Product.findById(productId);
        if (!product) return next(errorModel(400, "Product not found"));

        // Delete product images ...

        await Review.deleteMany({ productId });
        await product.deleteOne();
        res.status(200).json({ msg: "Product deleted successfully" });
    } catch (error) { next(error) }
}

// Get Product Reviews
exports.productReviews = async (req, res, next) => {
    const { productId } = req.params;
    const page = +req.query.page || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    if (!isMongoId(productId)) return next(errorModel(400, "Product Id Is Invalid"));

    try {
        const reviewsCount = await Product.countDocuments({ productId });
        const product = await Product.findById(productId);
        if (!product) return next(errorModel(400, "Product not found"));

        const reviews = await Review.find({ productId })
            .skip(skip).limit(limit).populate('user', ["name", "image"]);

        res.status(200).json({
            result: reviewsCount,
            pagenationData: {
                currentPage: page,
                totalPages: Math.ceil(reviewsCount / limit)
            },
            reviews
        });
    } catch (error) { next(error) }
}

// Review Product
exports.reviewProduct = async (req, res, next) => {
    const { _id } = req.user;
    const { productId } = req.params;
    const { comment, rating } = req.body;
    if (!isMongoId(productId)) return next(errorModel(400, "Product Id Is Invalid"));
    if (!rating) return next(errorModel(400, "Rating is required"));

    try {
        const product = await Product.findById(productId);
        if (!product) return next(errorModel(400, "Product not found"));

        const data = {}
        data.user = _id;
        data.productId = productId
        data.rating = rating;
        if (comment) data.comment = comment;

        const review = await Review.create(data)
        await Product.updateOne({ _id: productId }, { reviews: { $inc: 1 } })

        res.status(200).json(review);
    } catch (error) { next(error) }
}

// Delete Product Review
exports.unReviewProduct = async (req, res, next) => {
    const { _id } = req.user;
    const { productId, reviewId } = req.params;
    if (!isMongoId(productId)) return next(errorModel(400, "Product Id Is Invalid"));
    if (!isMongoId(reviewId)) return next(errorModel(400, "Review Id Is Invalid"));

    try {
        const product = await Product.findById(productId);
        if (!product) return next(errorModel(400, "Product not found"));

        const review = await Review.findById(reviewId);
        if (!review) return next(errorModel(400, "Review not found"));
        if (review.user !== _id) return next(errorModel(401, "You Must by the comment creator"));

        await review.deleteOne();
        await Product.updateOne({ _id: productId }, { reviews: { $inc: -1 } })

        res.status(200).json({ msg: "Review deleted successfully" });
    } catch (error) { next(error) }
}

// Report Product
exports.reportProduct = async (req, res, next) => {
    const { _id } = req.user;
    const { productId } = req.params;
    const { content } = req.body
    if (!content) return next(errorModel(400, "Must provide a report content"));
    if (!isMongoId(productId)) return next(errorModel(400, "Product Id Is Invalid"));

    try {
        const product = await Product.findById(productId);
        if (!product) return next(errorModel(400, "Product not found"));

        await Report.create({ user: _id, productId, content });

        res.status(200).json({ msg: "Reported successfully" });
    } catch (error) { next(error) }
}
