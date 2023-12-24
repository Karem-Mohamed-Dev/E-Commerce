const Seller = require("../models/Seller");
const Product = require("../models/Product");
const Review = require("../models/Review");
const Report = require("../models/Report");
const Cart = require("../models/Cart");

const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const { isEmail, isStrongPassword, isMongoId } = require("validator");
const errorModel = require("../utils/errorModel");
const { cloudinary } = require("../utils/upload");

// Login
exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) return next(errorModel(400, 'Email and Password are reqired'));

    if (!isEmail(email)) return next(errorModel(400, 'Please enter a valid email'))
    if (!isStrongPassword(password)) return next(errorModel(400, "Password must be at least 8 with one character upper case and one character lower case and one symbol"));

    try {
        const seller = await Seller.findOne({ email }, ["-updatedAt", "-__v", "-products", "-resetPass"]);
        if (!seller) return next(errorModel(400, 'No seller found'));

        const validPass = await bcrypt.compare(password, seller.password);
        if (!validPass) return next(errorModel(400, 'Email or password is invalid'));
        const token = generateToken(seller._id, 'seller');

        if (seller.ban) return next(errorModel(401, 'You are banned'));
        if (!seller.activated) {
            const verifyToken = jwt.sign({ email, role: "seller" }, process.env.SECRET, { expiresIn: '1h' });
            sendEmail(email, "Verify Your Email", `
         "<p>To verify your account <a href="http://localhost:5000/api/v1/auth/verify/${verifyToken}">Click Here<a></p>
        ` )
            return next(errorModel(400, 'Your account is not activated'));
        }

        const { password: pass, ...other } = seller._doc;
        res.status(200).json({ token, ...other });
    } catch (error) { next(error) }
}

// Register
exports.register = async (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return next(errorModel(400, 'Name, Email and Password are reqired'));

    if (name.length < 2 || name.length > 20) return next(errorModel(400, "Name can't be less than 2 or bigger than 20 characters"));
    if (!isEmail(email)) return next(errorModel(400, "Please enter a valid email"))
    if (!isStrongPassword(password)) return next(errorModel(400, "Password must be at least 8 with one character upper case and one character lower case and one symbol"));

    try {
        const exists = await Seller.findOne({ email });
        if (exists) return next(errorModel(400, "Seller already exists"));

        const hash = await bcrypt.hash(password, 10);
        const seller = await Seller.create({ name, email, password: hash });

        const { password: pass, updatedAt, __v, products, resetPass, ...other } = seller._doc;
        const token = generateToken(seller._id, 'seller');

        const verifyToken = jwt.sign({ email, role: "seller" }, process.env.SECRET, { expiresIn: '1h' });
        sendEmail(email, "Verify Your Email", `
         "<p>To verify your account <a href="http://localhost:5000/api/v1/auth/verify/${verifyToken}">Click Here<a></p>
        ` )

        res.status(201).json({ token, ...other });
    } catch (error) { next(error) }
}

// Change Password
exports.changePassword = async (req, res, next) => {
    const seller = req.seller;
    const { oldPass, newPass } = req.body;

    if (!oldPass || !newPass) return next(errorModel(400, "All fields are reqired"));
    if (oldPass === newPass) return next(errorModel(400, "New Password must be diffrent"));

    if (!isStrongPassword(oldPass)) return next(errorModel(400, "Old Password must be at least 8 with one character upper case and one character lower case and one symbol"));
    if (!isStrongPassword(newPass)) return next(errorModel(400, "New Password must be at least 8 with one character upper case and one character lower case and one symbol"));

    try {
        const validPass = await bcrypt.compare(oldPass, seller.password);
        if (!validPass) return next(errorModel(400, "Password is wrong"));

        const hash = await bcrypt.hash(newPass, 10);
        seller.password = hash;
        seller.save();

        res.status(200).json({ msg: "Password Changed" });
    } catch (error) { next(error) }
}

// Update Seller
exports.updateSeller = async (req, res, next) => {
    const seller = req.seller;
    const { name, email, phone, bio, country, city, postCode } = req.body;
    const files = req.files;

    if (!files && Object.keys(req.body).length === 0) return next(errorModel(400, "Provide atleast one Field"));

    if (name) {
        if (name.length < 2 || name.length > 20) return next(errorModel(400, "name can't be less than 2 or bigger than 20 characters"));
        seller.name = name;
    }
    if (email) {
        if (!isEmail(email)) return next(errorModel(400, "Please enter a valid email"));
        seller.email = email;
    }
    if (phone) seller.phone = phone;
    if (bio) seller.bio = bio;
    if (country) seller.country = country;
    if (city) seller.city = city;
    if (postCode) seller.postCode = postCode;

    try {
        if (files) {
            const image = req.files.image[0].path;
            const background = req.files.background[0].path;
            if (image) {
                if (seller.image.publicId) await cloudinary.uploader.destroy(seller.image.publicId);
                const result = await cloudinary.uploader.upload(image, { folder: 'seller_image' });
                seller.image.url = result.secure_url;
                seller.image.publicId = result.public_id;
            }
            if (background) {
                if (seller.backgroundImage.publicId) await cloudinary.uploader.destroy(seller.backgroundImage.publicId);
                const result = await cloudinary.uploader.upload(background, { folder: 'seller_background' });
                seller.backgroundImage.url = result.secure_url;
                seller.backgroundImage.publicId = result.public_id;
            }
        }
        const curSeller = await seller.save();
        const { password: pass, resetPass, ...other } = curSeller._doc;
        res.status(200).json(other);
    } catch (error) { next(error) }
}

// Delete Seller
exports.deleteSeller = async (req, res, next) => {
    const { _id, role } = req.tokenData;
    if (role !== "seller") return next(errorModel(401, "Not Authorized"));

    try {
        const seller = await Seller.findById(_id);
        if (!seller) return next(errorModel(404, "seller Not Found"));
        if (!seller.activated) return next(errorModel(400, 'You need to verify your email first'));
        if (seller.ban) return next(errorModel(401, 'You are banned'));

        if (seller.image.publicId) await cloudinary.uploader.destroy(seller.image.publicId)
        if (seller.backgroundImage.publicId) await cloudinary.uploader.destroy(seller.backgroundImage.publicId)

        if (seller.products.length > 0) {
            for (let productId of seller.products) await Cart.updateMany({ $in: { products: productId } }, { $pull: { products: productId } });
            await Report.deleteMany({ productId: seller.products });
            await Review.deleteMany({ productId: seller.products });

            const products = await Product.find({ _id: seller.products })
            for (let product of products) {
                for (let media of product.media) {
                    if (media.publicId) await cloudinary.uploader.destroy(media.publicId)
                }
                await product.deleteOne();
            }
        }
        await seller.deleteOne();
        res.status(200).json({ msg: 'Seller deleted successfully' });
    } catch (error) { next(error) }
}

// Get Seller Products
exports.getSellerProducts = async (req, res, next) => {
    const { sellerId } = req.params;
    if (!isMongoId(sellerId)) return next(errorModel(400, "Invalid Seller Id"))
    const page = +req.query.page || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    try {
        const seller = await Seller.findById(sellerId, 'products')
            .slice('products', [skip, limit]).populate('products', ["title", "media", "price", "rating"]);
        if (!seller) return next(errorModel(404, "Seller not found"));

        res.status(200).json(seller.products);
    } catch (error) { next(error) }
}

// Get Seller
exports.getSeller = async (req, res, next) => {
    const { sellerId } = req.params;
    if (!isMongoId(sellerId)) return next(errorModel(400, "Invalid Seller Id"));

    try {
        const seller = await Seller.findById(sellerId);
        if (!seller) return next(errorModel(404, "Seller not found"));

        const { password: pass, updatedAt, __v, products, resetPass, ...other } = seller._doc;

        res.status(200).json(other);
    } catch (error) { next(error) }
}