const User = require("../models/User");

const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const { isEmail, isStrongPassword, isMongoId, isEmpty } = require("validator");
const errorModel = require("../utils/errorModel");

// Login
exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) return next(errorModel(400, 'All fields are reqired'));

    if (!isEmail(email)) return next(errorModel(400, 'Please enter a valid email'))
    if (!isStrongPassword(password)) return next(errorModel(400, "Password must be at least 8 with one character upper case and one character lower case and one symbol"));

    try {
        const user = await User.findOne({ email }, ["-updatedAt", "-__v", "-products", "-resetPass"]);
        if (!user) return next(errorModel(400, 'No user found'));

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return next(errorModel(400, 'Email or password is invalid'));
        const token = generateToken(user._id, 'user');

        if (!user.activated) {
            const verifyToken = jwt.sign({ email, role: "user" }, process.env.SECRET, { expiresIn: '1h' });
            sendEmail(email, "Verify Your Email", `
         "<p>To verify your account <a href="http://localhost:5000/api/v1/auth/verify/${verifyToken}">Click Here<a></p>
        ` )
            return next(errorModel(400, 'Your account is not activated'));
        }

        const { password: pass, ...other } = user._doc;
        res.status(200).json({ token, ...other });
    } catch (error) { next(error) }
}

// Register
exports.register = async (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return next(errorModel(400, 'All fields are reqired'));

    if (name.length < 2 || name.length > 20) return next(errorModel(400, "name can't be less than 2 or bigger than 20 characters"));
    if (!isEmail(email)) return next(errorModel(400, "Please enter a valid email"))
    if (!isStrongPassword(password)) return next(errorModel(400, "Password must be at least 8 with one character upper case and one character lower case and one symbol"));

    try {
        const exists = await User.findOne({ email });
        if (exists) return next(errorModel(400, "User already exists"));

        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hash });

        const { password: pass, updatedAt, __v, products, resetPass, ...other } = user._doc;
        const token = generateToken(user._id, 'user');

        const verifyToken = jwt.sign({ email, role: "user" }, process.env.SECRET, { expiresIn: '1h' });
        sendEmail(email, "Verify Your Email", `
         "<p>To verify your account <a href="http://localhost:5000/api/v1/auth/verify/${verifyToken}">Click Here<a></p>
        ` )

        res.status(200).json({ token, ...other });
    } catch (error) { next(error) }
}

// Change Password
exports.changePassword = async (req, res, next) => {
    const user = req.user;
    const { oldPass, newPass } = req.body;

    if (!oldPass || !newPass) return next(errorModel(400, "All fields are reqired"));
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

// Get Favorits
exports.getFavorits = async (req,res,next) => {

}

// Add Product To Favorits
exports.addFavorite = async (req,res,next) => {

}