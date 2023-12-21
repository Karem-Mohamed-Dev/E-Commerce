const Admin = require("../models/Admin");
const User = require("../models/User");
const Seller = require("../models/Seller");

const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const { isEmail, isStrongPassword } = require("validator");
const errorModel = require("../utils/errorModel");
const sendEmail = require("../utils/sendEmail");

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

// Get Warned Sellers
exports.warned = async (req, res, next) => {

    // try {
    //     const sellers = await Seller.find({ warnings: { $gtr: 0 } })

    // } catch (error) { next(error) }
}

// Warn Sellers
exports.warn = async (req, res, next) => {
    const { sellerId } = req.params;
    const { content } = req.body;

    try {
        const seller = await Seller.findOne(sellerId);
        if (!seller) return next(errorModel(404, "Seller Not Found"));

        seller.warning += 1;
        await seller.save();
        sendEmail(seller.email, "Warning", content);

        res.status(200).json({ msg: 'Seller Warned successfully' });
    } catch (error) { next(error) }
}

// UnWarn Sellers
exports.unWarn = async (req, res, next) => {
    const { sellerId } = req.params;

    try {
        const seller = await Seller.findOne(sellerId);
        if (!seller) return next(errorModel(404, "Seller Not Found"));

        seller.warning -= 1;
        await seller.save();
        sendEmail(seller.email, "Warning", "We Romved One Warning From Your Account");

        res.status(200).json({ msg: 'Seller UnWarned successfully' });
    } catch (error) { next(error) }
}

// Get Banned Sellers
exports.banned = async (req, res, next) => {
    const page = +req.query.page || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    try {
        const bannedCount = await Seller.countDocuments({ ban: true });
        const sellers = await Seller.find({ ban: true })
        .skip(skip).limit(limit);

        res.status(200).json({ 
            result: bannedCount,
            pagenationData: {
                currentPage: page,
                totalPages: Math.ceil(result / limit)
            },
            banned: sellers
         });
    } catch (error) { next(error) }
}

// Ban Sellers
exports.ban = async (req, res, next) => {
    const { sellerId } = req.params;

    try {
        const seller = await Seller.findOne(sellerId);
        if (!seller) return next(errorModel(404, "Seller Not Found"));

        seller.ban = true;
        await seller.save();
        sendEmail(seller.email, "Ban", "You Got Banned for more info please contact support");

        res.status(200).json({ msg: 'Seller Banned successfully' });
    } catch (error) { next(error) }
}

// UnBan Sellers
exports.unBan = async (req, res, next) => {
    const { sellerId } = req.params;

    try {
        const seller = await Seller.findOne(sellerId);
        if (!seller) return next(errorModel(404, "Seller Not Found"));

        seller.ban = false;
        await seller.save();
        sendEmail(seller.email, "UnBan", "You Got UnBanned ");

        res.status(200).json({ msg: 'Seller UnBanned successfully' });
    } catch (error) { next(error) }
}

// Reports
exports.reports = async (req, res, next) => {
    res.send('Reports');
}