const Seller = require("../models/Seller");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

// Login
exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) return next(errorModel(400, 'All fields are reqired'));

    try {
        const seller = await Seller.find({ email });
        if (!seller) return next(errorModel(400, 'No user found'));

        const validPass = await bcrypt.compare(password, seller.password);
        if (!validPass) return next(errorModel(400, 'Email or password is invalid'));
        const token = generateToken(seller._id, 'seller');

        const { password: pass, updatedAt, __v, products, resetPass, ...other } = seller._doc;
        res.status(200).json({ token, ...other });
    } catch (error) { next(error) }
}

// Register
exports.register = async (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return next(errorModel(400, 'All fields are reqired'));

    try {
        const hash = await bcrypt.hash(password, 10);
        const seller = await Seller.create({ name, email, password: hash });
        const { password: pass, updatedAt, __v, products, resetPass, ...other } = seller._doc;
        const token = generateToken(seller._id, 'seller');
        res.status(200).json({ token, ...other });
    } catch (error) { next(error) }
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