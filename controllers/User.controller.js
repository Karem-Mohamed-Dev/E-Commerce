const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Login
exports.login = async (req, res, next) => {
    res.send('login')
}

// Register
exports.register = async (req, res, next) => {
    res.send('register')
}

// Change Password
exports.changePassword = async (req, res, next) => {
    res.send('Change Password')
}

// Update User
exports.updateUser = async (req, res, next) => {
    res.send('Update User')
}

// Delete User
exports.deleteUser = async (req, res, next) => {
    res.send('Delete User')
}

// Get User
exports.getUser = async (req, res, next) => {
    res.send('Get User')
}