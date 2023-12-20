const Admin = require("../models/Admin");
const User = require("../models/User");
const Seller = require("../models/Seller");

const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const { isEmail, isStrongPassword } = require("validator");
const errorModel = require("../utils/errorModel");

//Admin Login
exports.adminLogin = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) return next(errorModel(400, 'All fields are reqired'));

    if (!isEmail(email)) return next(errorModel(400, 'Please enter a valid email'))
    if (!isStrongPassword(password)) return next(errorModel(400, "Password must be at least 8 with one character upper case and one character lower case and one symbol"));

    try {
        const admin = await Admin.findOne({ email });
        if (!admin) return next(errorModel(400, 'Email not found'));

        const validPass = await bcrypt.compare(password, admin.password);
        if (!validPass) return next(errorModel(400, 'Email or password is invalid'));
        const token = generateToken(admin._id, 'admin');

        const { password: pass, updatedAt, __v, resetPass, ...other } = admin._doc;
        res.status(200).json({ token, ...other });
    } catch (error) { next(error) }
}

// Add Admin
exports.addAdmin = async (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return next(errorModel(400, 'All fields are reqired'));

    if (name.length < 2 || name.length > 20) return next(errorModel(400, "name can't be less than 2 or bigger than 20 characters"));
    if (!isEmail(email)) return next(errorModel(400, 'Please enter a valid email'))
    if (!isStrongPassword(password)) return next(errorModel(400, "Password must be at least 8 with one character upper case and one character lower case and one symbol"));

    try {
        const exists = await Admin.findOne({ email });
        if (exists) return next(errorModel(400, "Admin already exists"));

        const hash = await bcrypt.hash(password, 10);
        const admin = await Admin.create({ name, email, password: hash });
        const { password: pass, updatedAt, __v, resetPass, ...other } = admin._doc;
        const token = generateToken(admin._id, 'admin');
        res.status(200).json({ token, ...other });
    } catch (error) { next(error) }
}

// Delete Admin
exports.deleteAdmin = async (req, res, next) => {
    const { adminId } = req.params;

    try {
        const admin = await Admin.findById(adminId);
        if (!admin) return next(errorModel(404, 'Admin not found'));
        await admin.deleteOne();
        res.status(200).json({ msg: "Admin deleted successfully" })
    } catch (err) { next(err) }
}

// Search For Seller 
exports.sellerSearch = async (req, res, next) => {
    const name = req.query.name || "";
    const page = +req.query.page || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    try {
        const sellersCount = await Seller.countDocuments({ name: { $regex: name, $options: "i" } });
        const users = await Seller.find({ name: { $regex: name, $options: "i" } }, ["_id", "name", "image"])
            .skip(skip).limit(limit);

        res.status(200).json({
            result: sellersCount,
            pagenationData: {
                currentPage: page,
                totalPages: Math.ceil(sellersCount / limit)
            },
            users
        })
    } catch (error) { next(error) }
}

// Get Warned Users
exports.warned = async (req, res, next) => {
res.send('Warned Users');
}

// Warn User
exports.warn = async (req, res, next) => {
    res.send('Warn');
}

// UnWarn User
exports.unWarn = async (req, res, next) => {
    res.send('UnWarn');
}

// Ban
exports.ban = async (req, res, next) => {
    res.send('Ban');
}

// Get Banned Users
exports.banned = async (req, res, next) => {
    res.send('banned');
}

// UnBan
exports.unBan = async (req, res, next) => {
    res.send('UnBan');
}

// Reports
exports.reports = async (req, res, next) => {
    res.send('Reports');
}