const Seller = require("../models/Seller");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Login
exports.login = async (req, res, next) => {
    res.send('login Seller')
}

// Register
exports.register = async (req, res, next) => {
    res.send('register Seller')
}

// Change Password
exports.changePassword = async (req, res, next) => {
    res.send('Change Seller Password')
}

// Update User
exports.updateUser = async (req, res, next) => {
    res.send('Update Seller')
}

// Delete User
exports.deleteUser = async (req, res, next) => {
    res.send('Delete Seller')
}

// Get User Products
exports.getUserProducts = async (req, res, next) => {
    res.send('Get Seller Products')
}

// Get User
exports.getUser = async (req, res, next) => {
    res.send('Get Seller')
}