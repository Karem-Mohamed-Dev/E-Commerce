const Brand = require('../models/Brand');
const Admin = require("../models/Admin");

// Get Brands
exports.getBrands = async (req, res, next) => {
    res.send('Get Brands');
}

// Create Brand
exports.createBrand = async (req, res, next) => {
    res.send('Create Brand');
}

// Edit Brand
exports.editBrand = async (req, res, next) => {
    res.send('Edit Brand');
}

// Delete SubCategory
exports.deleteBrand = async (req, res, next) => {
    res.send('Delete Brand');
}