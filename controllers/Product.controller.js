const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const Brand = require("../models/Brand");
const Review = require("../models/Review");

const { isMongoId } = require("validator");
const errorModel = require("../utils/errorModel");
const Report = require("../models/Report");
const calcRating = require("../utils/calcRating");
const { cloudinary } = require("../utils/upload")

// Search
exports.search = async (req, res, next) => {
    const { title, brand, category, subCategory, price, sort } = req.query;
    const page = +req.query.page || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    try {
        const query = {};
        if (title) query.title = { $regex: title, $options: 'i' };
        if (price) query.price = { $gt: price };
        if (brand) query.brand = brand;
        if (category) query.category = category;
        if (subCategory) query.subCategory = subCategory;
        const sortBy = sort || "-createdAt"

        const productsCount = await Product.countDocuments(query);
        const products = await Product.find(query, ["-updatedAt", "-__v", "-stock", "-reviews", "-sold", "-favorited", "-description"])
            .sort(sortBy).skip(skip).limit(limit).populate('seller', ['name', 'image']);

        res.status(200).json({
            result: productsCount,
            pagenationData: {
                currentPage: page,
                totalPages: Math.ceil(productsCount / limit)
            },
            products
        });
    } catch (error) { next(error) }
}

// Create Product
exports.createProduct = async (req, res, next) => {
    const seller = req.seller;
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
            await subCat.updateOne({ $inc: { products: 1 } })
            data.subCategory = subCat.name;
        }
        if (brand) {
            if (!isMongoId(brand)) return next(errorModel(400, "Brand Id Is Invalid"));
            const brandData = await Brand.findById(brand);
            if (!brandData) return next(errorModel(400, "Brand not Found"));
            await brandData.updateOne({ $inc: { products: 1 } })
            data.brand = brandData.name;
        }

        if (stock) data.stock = stock;
        if (discount) data.discount = discount;

        const categoryData = await Category.findById(category);
        if (!categoryData) return next(errorModel(400, "Category not Found"));
        await categoryData.updateOne({ $inc: { products: 1 } })

        let media = []
        for (let image of files) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(image.path, { folder: 'product_images' });
            media.push({ url: secure_url, publicId: public_id });
        }

        const product = await Product.create({ seller: seller._id, title, description, category: categoryData.name, price, media, ...data })

        seller.products.push(product._id);
        await seller.save();

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
    if (!isMongoId(productId)) return next(errorModel(400, "Product Id Is Invalid"));

    const { title, description, category, subCategory, price, brand, stock, discount, deleteImages } = req.body;
    const files = req.files;

    if (!files && Object.keys(req.body).length === 0) return next(errorModel(400, "Provide at least one field"));

    try {
        const product = await Product.findById(productId, ["-favorited", "-sold", "-updatedAt", "-__v"])
        if (!product) return next(errorModel(400, "Product not found"));
        if (product.seller.toString() !== req.seller._id.toString()) return next(errorModel(401, "Not Authorized"));

        if (category) {
            if (!isMongoId(category)) return next(errorModel(400, "Category Id Is Invalid"));
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

        if (files) {
            const media = [];
            for (let image of files) {
                const { secure_url, public_id } = await cloudinary.uploader.upload(image.path, { folder: 'product_images' })
                media.push({ url: secure_url, publicId: public_id })
            }
            product.media.push(...media);
        }

        if (deleteImages) {
            const arr = JSON.parse(deleteImages)
            if (!Array.isArray(arr)) return next(errorModel(400, "deleteImages must be array of images public Id"));
            for (let id of arr) {
                await cloudinary.uploader.destroy(id);
                product.media = product.media.filter(ele => ele.publicId !== id)
            }
        }
        await product.save();

        res.status(200).json(product);
    } catch (error) { next(error) }
}

// Delete Product
exports.deleteProduct = async (req, res, next) => {
    const seller = req.seller;
    const { productId } = req.params;
    if (!isMongoId(productId)) return next(errorModel(400, "Product Id Is Invalid"));

    try {
        const product = await Product.findById(productId);
        if (!product) return next(errorModel(400, "Product not found"));
        if (product.seller.toString() !== seller._id.toString()) return next(errorModel(401, "Not Authorized"));

        await Category.updateOne({ name: product.category }, { $inc: { products: -1 } })
        if (product.subCategory) await SubCategory.updateOne({ name: product.subCategory }, { $inc: { products: -1 } })
        if (product.brand) await Brand.updateOne({ name: product.brand }, { $inc: { products: -1 } })


        const cartsToUpdate = await Cart.find({ 'products.product': product._id });
        for (const cart of cartsToUpdate) {
            cart.products = cart.products.filter(ele => ele.product.toString() !== product._id);
            await cart.save();
        }


        for (let image of product.media) await cloudinary.uploader.destroy(image.publicId);
        seller.products.pull(product._id);
        await seller.save();
        await Review.deleteMany({ productId });
        await product.deleteOne();

        res.status(200).json({ msg: "Product deleted successfully" });
    } catch (error) { next(error) }
}

// Get Product Reviews
exports.productReviews = async (req, res, next) => {
    const { productId } = req.params;
    if (!isMongoId(productId)) return next(errorModel(400, "Product Id Is Invalid"));
    const page = +req.query.page || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    try {
        const reviewsCount = await Product.countDocuments({ _id: productId });
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
    if (!isMongoId(productId)) return next(errorModel(400, "Product Id Is Invalid"));
    const { comment, rating } = req.body;
    if (rating === undefined) return next(errorModel(400, "Rating is required"));

    try {
        const product = await Product.findById(productId);
        if (!product) return next(errorModel(400, "Product not found"));

        const data = {}
        data.user = _id;
        data.productId = productId
        data.rating = rating;
        if (comment) data.comment = comment;

        const review = await Review.create(data)
        const rates = await calcRating(product._id);

        product.reviews += 1;
        product.rating = rates
        await product.save();

        res.status(201).json(review);
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
        if (review.user.toString() !== _id.toString()) return next(errorModel(401, "You Must by the comment creator"));

        await review.deleteOne();
        const rates = await calcRating(product._id);
        await product.updateOne({ $inc: { reviews: -1 }, rating: rates })

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

        res.status(201).json({ msg: "Reported successfully" });
    } catch (error) { next(error) }
}
