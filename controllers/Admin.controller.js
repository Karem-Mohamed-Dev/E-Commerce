const Admin = require("../models/Admin");
const Seller = require("../models/Seller");
const Report = require("../models/Report");

const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const { isEmail, isStrongPassword, isMongoId } = require("validator");
const errorModel = require("../utils/errorModel");
const sendEmail = require("../utils/sendEmail");
const { cloudinary } = require("../utils/upload");

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
        res.status(201).json({ token, ...other });
    } catch (error) { next(error) }
}

// Edit Admin
exports.editAdmin = async (req, res, next) => {
    const admin = req.admin;
    const file = req.file ? req.file.path : null;
    const { name } = req.body;
    if (!name && !file) return next(errorModel(400, "Provide at least one field"));

    try {
        if (file) {
            if (admin.image.publicId) await cloudinary.uploader.destroy(admin.image.publicId);
            const { secure_url, public_id } = await cloudinary.uploader.upload(file, { folder: 'admin_images' });
            admin.image = { url: secure_url, publicId: public_id }
        }
        if (name) admin.name = name;
        await admin.save();

        res.status(200).json({ msg: "Admin Info Updated" });
    } catch (error) { next(error) }
}

// Delete Admin
exports.deleteAdmin = async (req, res, next) => {
    const { adminId } = req.params;
    if (!isMongoId(adminId)) return next(errorModel(400, "Please Provide a Valid Admin Id"));

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
    const page = +req.query.page || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    try {
        const sellersCount = await Seller.countDocuments({ warnings: { $gt: 0 } });
        const sellers = await Seller.find({ warnings: { $gt: 0 } }, ["_id", "name", "image"])
            .skip(skip).limit(limit);

        res.status(200).json({
            result: sellersCount,
            pagenationData: {
                currentPage: page,
                totalPages: Math.ceil(sellersCount / limit)
            },
            sellers
        });

    } catch (error) { next(error) }
}

// Warn Sellers
exports.warn = async (req, res, next) => {
    const { sellerId } = req.params;
    if (!isMongoId(sellerId)) return next(errorModel(400, "Please Provide a Valid Seller Id"));

    const { content } = req.body;
    if (!content) return next(errorModel(400, "Please Provide a Warning Content"));

    try {
        const seller = await Seller.findById(sellerId);
        if (!seller) return next(errorModel(404, "Seller Not Found"));

        if (seller.warnings >= 3) {
            if (seller.ban) return next(errorModel(404, "User Got More than 3 Warnings And Banned Already"));
            seller.ban = true;
            await seller.save();
            sendEmail(seller.email, "Ban", content);
            return res.status(200).json({ msg: 'Seller Got More than 3 Warnings Already So He Got Banned' });
        }

        seller.warnings += 1;
        await seller.save();
        sendEmail(seller.email, "Warning", content);

        res.status(200).json({ msg: 'Seller Warned successfully' });
    } catch (error) { next(error) }
}

// UnWarn Sellers
exports.unWarn = async (req, res, next) => {
    const { sellerId } = req.params;
    if (!isMongoId(sellerId)) return next(errorModel(400, "Please Provide a Valid Seller Id"));

    try {
        const seller = await Seller.findById(sellerId);
        if (!seller) return next(errorModel(404, "Seller Not Found"));

        if (seller.warnings === 0) return next(errorModel(400, "There Is No Seller Warnings To Remove"));

        if (seller.warnings === 3) {
            sendEmail(seller.email, "UnBaned", "We Romved One Warning And UnBanned Your Account");
            seller.ban = false;
        } else sendEmail(seller.email, "Warning", "We Romved One Warning From Your Account");

        seller.warnings -= 1;
        await seller.save();

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
        const sellers = await Seller.find({ ban: true }, ['name', 'image'])
            .skip(skip).limit(limit);

        res.status(200).json({
            result: bannedCount,
            pagenationData: {
                currentPage: page,
                totalPages: Math.ceil(bannedCount / limit)
            },
            banned: sellers
        });
    } catch (error) { next(error) }
}

// Ban Sellers
exports.ban = async (req, res, next) => {
    const { sellerId } = req.params;
    if (!isMongoId(sellerId)) return next(errorModel(400, "Please Provide a Valid Seller Id"));

    try {
        const seller = await Seller.findById(sellerId);
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
    if (!isMongoId(sellerId)) return next(errorModel(400, "Please Provide a Valid Seller Id"));

    try {
        const seller = await Seller.findById(sellerId);
        if (!seller) return next(errorModel(404, "Seller Not Found"));

        seller.ban = false;
        await seller.save();
        sendEmail(seller.email, "UnBan", "You Got UnBanned");

        res.status(200).json({ msg: 'Seller UnBanned successfully' });
    } catch (error) { next(error) }
}

// Reports
exports.reports = async (req, res, next) => {
    const page = +req.query.page || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    try {
        const reportesCount = await Report.countDocuments({});
        const reports = await Report.find({}, ["-__v", "-updatedAt"])
            .skip(skip).limit(limit)
            .populate('productId', ["title", "media", "price", "rating"])
            .populate('user', ['name', 'email', 'images']);

        res.status(200).json({
            result: reportesCount,
            pagenationData: {
                currentPage: page,
                totalPages: Math.ceil(reportesCount / limit)
            },
            reports
        });
    } catch (error) { next(error) }
}