const User = require("../models/User");
const Product = require("../models/Product");
const Review = require("../models/Review");
const Report = require("../models/Report");

const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const { isEmail, isStrongPassword, isMongoId } = require("validator");
const errorModel = require("../utils/errorModel");
const { cloudinary } = require("../utils/upload")

// Login
exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) return next(errorModel(400, 'Email and Password are reqired'));

    if (!isEmail(email)) return next(errorModel(400, 'Please enter a valid email'))
    if (!isStrongPassword(password)) return next(errorModel(400, "Password must be at least 8 with one character upper case and one character lower case and one symbol"));

    try {
        const user = await User.findOne({ email }, ["-updatedAt", "-__v", "-resetPass", "-favorites", "-orders"]);
        if (!user) return next(errorModel(400, 'No user found'));

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return next(errorModel(400, 'Email or password is invalid'));
        const token = generateToken(user._id, 'user');

        if (!user.activated) {
            const verifyToken = jwt.sign({ email, role: "user" }, process.env.SECRET, { expiresIn: '1h' });
            sendEmail(email, "Verify Your Email", `
         "<p>To verify your account <a href="http://localhost:5000/api/v1/auth/verify/${verifyToken}">Click Here<a></p>
        ` )
            return next(errorModel(400, 'Your account is not activated we sent email with activation link'));
        }

        const { password: pass, ...other } = user._doc;
        res.status(200).json({ token, ...other });
    } catch (error) { next(error) }
}

// Register
exports.register = async (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return next(errorModel(400, 'Name, Email, and Password are reqired'));

    if (name.length < 2 || name.length > 20) return next(errorModel(400, "Name can't be less than 2 or bigger than 20 characters"));
    if (!isEmail(email)) return next(errorModel(400, "Please enter a valid email"))
    if (!isStrongPassword(password)) return next(errorModel(400, "Password must be at least 8 with one character upper case and one character lower case and one symbol"));

    try {
        const exists = await User.findOne({ email });
        if (exists) return next(errorModel(400, "User already exists"));

        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hash });

        const { password: pass, updatedAt, __v, favorites, orders, resetPass, ...other } = user._doc;
        const token = generateToken(user._id, 'user');

        const verifyToken = jwt.sign({ email, role: "user" }, process.env.SECRET, { expiresIn: '1h' });
        sendEmail(email, "Verify Your Email", `
         "<p>To verify your account <a href="http://localhost:5000/api/v1/auth/verify/${verifyToken}">Click Here<a></p>
        ` )

        res.status(201).json({ token, ...other });
    } catch (error) { next(error) }
}

// Change Password
exports.changePassword = async (req, res, next) => {
    const user = req.user;
    const { oldPass, newPass } = req.body;

    if (!oldPass || !newPass) return next(errorModel(400, "oldPass and newPass are reqired"));
    if (oldPass === newPass) return next(errorModel(400, "New Password must be diffrent"));

    if (!isStrongPassword(oldPass)) return next(errorModel(400, "Old Password must be at least 8 with one character upper case and one character lower case and one symbol"));
    if (!isStrongPassword(newPass)) return next(errorModel(400, "New Password must be at least 8 with one character upper case and one character lower case and one symbol"));

    try {
        const validPass = await bcrypt.compare(oldPass, user.password);
        if (!validPass) return next(errorModel(400, "Password is wrong"));

        const hash = await bcrypt.hash(newPass, 10);
        user.password = hash;
        user.save();

        res.status(200).json({ msg: "Password Changed" });
    } catch (error) { next(error) }
}

// Update User
exports.updateUser = async (req, res, next) => {
    const user = req.user;
    const { name, email, phone, country, city, postCode } = req.body;
    const file = req.file;
    if (!file && Object.keys(req.body).length === 0) return next(errorModel(400, "Provide At Least One Field"));
    console.log(req.body);
    try {
        if (file) {
            if (user.image.publicId)
                await cloudinary.uploader.destroy(user.image.publicId)
            const result = await cloudinary.uploader.upload(file.path, { folder: 'user_image' })
            user.image.url = result.secure_url;
            user.image.publicId = result.public_id;
        }
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (country) user.address.country = country;
        if (city) user.address.city = city;
        if (postCode) user.address.postCode = postCode;
        await user.save();

        res.status(200).json({ msg: "User Info Updated" });
    } catch (error) { next(error) }
}

// Delete User
exports.deleteUser = async (req, res, next) => {
    const { _id, favorites, image } = req.user;

    try {
        const userReviews = await Review.find({ user: _id });
        for (let rev of userReviews) {
            await Product.updateOne({ _id: rev.productId }, { $inc: { reviews: -1 } });
            await rev.deleteOne();
        }

        for (let fav of favorites) await Product.updateOne({ _id: fav }, { $inc: { favorited: -1 } });
        if (image.publicId) await cloudinary.uploader.destroy(image.publicId)
        await Report.deleteMany({ user: _id });
        await User.deleteOne({ _id });

        res.status(200).json({ msg: "User deleted successfully" });
    } catch (error) { next(error) }
}

// Get User
exports.getUser = async (req, res, next) => {
    const { userId } = req.params;
    if (!isMongoId(userId)) return next(errorModel(400, "Please Provide a Valid User Id"))

    try {
        const user = await User.findById(userId, ["name", "email", "image", "phone", "adress"]);

        res.status(200).json(user)
    } catch (error) { next(error) }
}

// Get Favorites
exports.getFavorites = async (req, res, next) => {
    const user = req.user;
    const page = +req.query.page || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    try {
        const favorites = await Product.find({ _id: user.favorites }, ['title', 'description', 'price', 'media', 'discount', 'rating']).skip(skip).limit(limit);
        res.status(200).json({
            result: favorites.length,
            pagenationData: {
                currentPage: page,
                totalPages: Math.ceil(favorites.length / limit)
            },
            favorites
        });
    } catch (error) { next(error) }
}

// Add Product To Favorites
exports.addFavorite = async (req, res, next) => {
    const user = req.user;
    const { productId } = req.params;
    if (!isMongoId(productId)) return next(errorModel(400, "Please Provide a Valid Product Id"))

    try {
        const product = await Product.findById(productId, "favorited");
        if (!product) return next(errorModel(400, "Product not found"));

        user.favorites.push(productId);
        await user.save();
        await product.updateOne({ $inc: { favorited: 1 } });

        res.status(200).json({ msg: "Successfully added" });
    } catch (error) { next(error) }
}

// Remove Product From Favorites
exports.removeFavorite = async (req, res, next) => {
    const user = req.user;
    const { productId } = req.params;
    if (!isMongoId(productId)) return next(errorModel(400, "Please Provide a Valid Product Id"))

    try {
        const product = await Product.findById(productId, "favorited");

        user.favorites.pull(productId);
        await user.save();
        await product.updateOne({ $inc: { favorited: -1 } });

        res.status(200).json({ msg: "Successfully removed" });
    } catch (error) { next(error) }
}