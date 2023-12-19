const SubCategory = require('../models/SubCategory');
const Admin = require("../models/Admin");

// Get SubCategorys
exports.getSubCategorys = async (req, res, next) => {
    res.send('Get SubCategorys');
}

// Create SubCategory
exports.createSubCategory = async (req, res, next) => {
    res.send('Create SubCategory');
}

// Edit SubCategory
exports.editSubCategory = async (req, res, next) => {
    res.send('Edit SubCategory');
}

// Delete SubCategory
exports.deleteSubCategory = async (req, res, next) => {
    res.send('Delete SubCategory');
}