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

// Get Reset Password Code
exports.getCode = async (req, res, next) => {
    res.send('getCode')
}

// Verify Reset Password Code
exports.verifyCode = async (req, res, next) => {
    res.send('verifyCode')
}

// Reset Password
exports.resetPass = async (req, res, next) => {
    res.send('resetPass')
}