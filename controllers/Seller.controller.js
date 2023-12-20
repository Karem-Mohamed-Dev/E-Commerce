const Seller = require("../models/Seller");
const Product = require("../models/Product");
const Review = require("../models/Review");
const Report = require("../models/Report");
const Cart = require("../models/Cart");

const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const { isEmail, isStrongPassword } = require("validator");

// Login
exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) return next(errorModel(400, 'All fields are reqired'));

    if (!isEmail(email)) return next(errorModel(400, 'Please enter a valid email'))
    if (!isStrongPassword(password)) return next(errorModel(400, 'Please enter a strong password'));

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

    if (name.length < 2 || name.length > 20) return next(errorModel(400, "name cant't be less than 2 or bigger than 20 characters"));
    if (!isEmail(email)) return next(errorModel(400, "Please enter a valid email"))
    if (!isStrongPassword(password)) return next(errorModel(400, "Please enter a strong password"));

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
    const user = req.user;
    const { oldPass, newPass } = req.body;

    if (!oldPass || !newPass) return next(errorModel(400, "All fields are reqired"));
    if (oldPass === newPass) return next(errorModel(400, "New Password must be diffrent"));

    try {
        const validPass = await bcrypt.compare(oldPass, user.password);
        if (!validPass) return next(errorModel(400, "Password is wrong"));

        const hash = await bcrypt.hash(newPass, 10);
        user.password = hash;
        user.save();

        res.status(200).json({ msg: "Password Changed" });
    } catch (error) { next(error) }
}

// Update Seller
exports.updateUser = async (req, res, next) => {
    const user = req.user;
    const { name, email, phone, country, city, postCode } = req.body;
    const files = req.files;

    if (files) {
        //... 
    }

    if (name) {
        if (name.length < 2 || name.length > 20) return next(errorModel(400, "name cant't be less than 2 or bigger than 20 characters"));
        user.name = name;
    }
    if (email) {
        if (!isEmail(email)) return next(errorModel(400, "Please enter a valid email"));
        user.email = email
    }
    if (phone) user.phone = phone;
    if (country) user.country = country;
    if (city) user.city = city;
    if (postCode) user.postCode = postCode;

    try {
        const seller = await user.save();
        const { password: pass, updatedAt, __v, products, resetPass, ...other } = seller._doc;
        res.status(200).json(other);
    } catch (error) { next(error) }
}

// Delete Seller
exports.deleteUser = async (req, res, next) => {
    const user = req.user;

    try {
        if (user.user.products.length > 0) {
            for (let productId of user.products) {
                await Cart.updateMany({ $in: { products: productId } }, { $pull: { products: productId } });
            }
            await Report.deleteMany({ productId: user.products });
            await Review.deleteMany({ productId: user.products });
            await Product.deleteMany({ _id: user.products });
        }
        await user.deleteOne();
        res.status(200).json({ msg: 'Seller deleted successfully' });
    } catch (error) { next(error) }
}

// Get Seller Products
exports.getUserProducts = async (req, res, next) => {
    res.send('Get Seller Products')
}

// Get Seller
exports.getUser = async (req, res, next) => {
    res.send('Get Seller')
}