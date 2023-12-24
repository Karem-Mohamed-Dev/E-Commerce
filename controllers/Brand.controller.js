const Brand = require('../models/Brand');
const Product = require('../models/Product');

const { isMongoId } = require("validator");
const errorModel = require("../utils/errorModel");
const { cloudinary } = require("../utils/upload");

// Get Brands
exports.getBrands = async (req, res, next) => {
    const page = +req.params.page || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    try {
        const brandsCount = await Brand.countDocuments({});
        const brands = await Brand.find({})
            .skip(skip).limit(limit);

        res.status(200).json({
            result: brandsCount,
            paginationData: {
                currentPage: page,
                totalPages: Math.ceil(brandsCount / limit)
            },
            brands
        })
    } catch (err) { next(err) }
}

// Create Brand
exports.createBrand = async (req, res, next) => {
    const { name } = req.body;
    const file = req.file ? req.file.path : null;
    if (!file || !name) return next(errorModel(400, "Name And Image Are Required"));

    try {
        const slug = name.split(" ").join("-");

        const exist = await Brand.findOne({ name });
        if(exist) return next(errorModel(400, "Brand name already exist"));

        const { secure_url, public_id } = await cloudinary.uploader.upload(file, { folder: 'brand_images' });
        const image = { url: secure_url, publicId: public_id };
        const brand = await Brand.create({ name, slug, image });

        res.status(201).json(brand);
    } catch (error) { next(error) }
}

// Edit Brand
exports.editBrand = async (req, res, next) => {
    const { brandId } = req.params;
    if (!isMongoId(brandId)) return next(errorModel(400, "Please Provide a Valid Brand Id"));

    const { name } = req.body;
    const file = req.file ? req.file.path : null;
    if (!file && !name) return next(errorModel(400, "Please Provide At Least One Field"));

    try {
        const brand = await Brand.findById(brandId);
        if (!brand) return next(errorModel(404, "Brand not found"));

        if (name) {
            await Product.updateMany({ brand: brand.name }, { brand: name });
            brand.name = name;
            brand.slug = name.split(" ").join("-");
        }
        if (file) {
            await cloudinary.uploader.destroy(brand.image.publicId);
            const { secure_url, public_id } = await cloudinary.uploader.upload(file, { folder: 'brand_images' });
            const image = { url: secure_url, publicId: public_id };
            brand.image = image;
        }
        await brand.save();

        res.status(200).json({ brand: brand._doc });
    } catch (error) { next(error) }
}

// Delete SubCategory
exports.deleteBrand = async (req, res, next) => {
    const { brandId } = req.params;
    if (!isMongoId(brandId)) return next(errorModel(400, "Please Provide a Valid Brand Id"))

    try {
        const brand = await Brand.findById(brandId);
        if (!brand) return next(errorModel(404, "Brand not found"));

        await Product.updateMany({ brand: brand.name }, { brand: null })
        await cloudinary.uploader.destroy(brand.image.publicId);
        await brand.deleteOne();
        
        res.status(200).json({ msg: "Successfully deleted" });
    } catch (error) { next(error) }
}