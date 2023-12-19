const Category = require('../models/Category');
const Admin = require("../models/Admin");

// Get Categorys
exports.getCategorys = async (req, res, next) => {
    res.send('Get Categorys');
}

// Create Category
exports.createCategory = async (req, res, next) => {
    res.send('Create Category');
}

// Edit Category
exports.editCategory = async (req, res, next) => {
    res.send('Edit Category');
}

// Delete Category
exports.deleteCategory = async (req, res, next) => {
    res.send('Delete Category');
}