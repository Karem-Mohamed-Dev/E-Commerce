const Brand = require('../models/Brand');
const Product = require('../models/Product');

const { isMongoId } = require("validator");
const errorModel = require("../utils/errorModel");

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
    // const file = req.file;

    // if (!file || !name) return next(errorModel(400, "Name And Image Are Required"));
    const slug = name.split(" ").join("-");

    try {
        // file upload ...
        const image = { url: "123", publicId: "123" }; // Simulation until add image upload
        // ...
        const brand = await Brand.create({ name, slug, image });

        res.status(201).json(brand);
    } catch (error) { next(error) }
}

// Edit Brand
exports.editBrand = async (req, res, next) => {
    const { brandId } = req.params;
    if (!isMongoId(brandId)) return next(errorModel(400, "Please Provide a Valid Brand Id"));

    const { name } = req.body;
    const file = req.file;
    if (!file && !name) return next(errorModel(400, "Please Provide At Least One Field"));

    try {
        const brand = await Brand.findById(brandId);
        if (!brand) return next(errorModel(404, "Brand not found"));

        // file upload ...
        const image = { url: "", publicId: "" }; // Simulation until add image upload
        // ...

        if (name) {
            await Product.updateMany({ brand: brand.name }, { brand: name });
            brand.name = name;
            brand.slug = name.split(" ").join("-");
        }
        if (file) brand.image = image;
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

        // Image Delete ...

        await Product.updateMany({ brand: brand.name }, { brand: null })

        await brand.deleteOne();
        res.status(200).json({ msg: "Successfully deleted" });
    } catch (error) { next(error) }
}