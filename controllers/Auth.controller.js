const User = require("../models/User");
const Seller = require("../models/Seller");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const sendEmail = require("../utils/sendEmail");
const errorModel = require("../utils/errorModel");
const { isStrongPassword } = require("validator");


// Vevify Account
exports.verifyAccount = async (req, res, next) => {
    const { token } = req.params;

    try {
        const { email, role } = jwt.verify(token, process.env.SECRET);

        if (role === "user") {
            const user = await User.findOne({ email });
            if (!user) return next(errorModel(404, "User not found"));

            user.activated = true;
            await user.save();

        } else if (role === "seller") {
            const seller = await Seller.findOne({ email });
            if (!seller) return next(errorModel(404, "User not found"));

            seller.activated = true;
            await seller.save();
        }

        res.send("Verified");
    } catch (err) {
        if (err.message === "jwt expired")
            return res.send("Link expired");
        next(err)
    }

}

// Get Reset Password Code
exports.getCode = async (req, res, next) => {
    const { email } = req.body;

    const code = () => {
        let result = '';
        for (let i = 0; i < 6; i++)
            result += Math.floor(Math.random() * 10);
        return result;
    }
    try {
        const user = await User.findOne({ email });
        if (user) {
            user.resetPass = { code, expiresAt: Date.now() + 60 * 60 * 1000 };
            await user.save();
        } else {
            const seller = await Seller.findOne({ email });
            if (!seller) return next(errorModel(404, "User not found"));
            seller.resetPass = { code, expiresAt: Date.now() + 60 * 60 * 1000 };
            await seller.save();
        }
        sendEmail(email, "Password Reset", "Your password reset code is: " + code);

        res.status(200), json({ msg: "Email sent successfully" });
    } catch (error) { next(error) }
}

// Verify Reset Password Code
exports.verifyCode = async (req, res, next) => {
    const { code, email } = req.body;

    try {
        let token;

        const user = await User.findOne({ email });
        if (user) {
            if (user.resetPass.code === code) return next(errorModel(400, "Invalid Reset Password Code"));
            if (user.resetPass.expiresAt < Date.now()) return next(errorModel(400, "Code expired"));

            token = jwt.sign({ _id: user._id, code, role: "user" }, process.env.SECRET, { expiresIn: "1h" });
        } else {
            const seller = await Seller.findOne({ email });
            if (!seller) return next(errorModel(404, "User not found"));
            if (seller.resetPass.code === code) return next(errorModel(400, "Invalid Reset Password Code"));
            if (seller.resetPass.expiresAt < Date.now()) return next(errorModel(400, "Code expired"));

            token = jwt.sign({ _id: seller._id, code, role: "seller" }, process.env.SECRET, { expiresIn: "1h" });
        }

        res.status(200).json(token);
    } catch (error) { next(error) }
}

// Reset Password
exports.resetPass = async (req, res, next) => {
    const { token, newPass } = req.body;
    if (!isStrongPassword(password)) return next(errorModel(400, "Password must be at least 8 with one character upper case and one character lower case and one symbol"));

    try {
        const hash = await bcrypt.hash(newPass, 10);

        const { _id, role, code } = jwt.verify(token, process.env.SECRET);
        if (role === "user") {
            const user = await User.findById(_id);
            if (!user) return next(errorModel(404, "User not found"));
            if (user.resetPass.code === code) return next(errorModel(400, "Invalid Reset Password Code"));
            if (user.resetPass.expiresAt < Date.now()) return next(errorModel(400, "Code expired"));

            user.password = hash;
            user.resetPass.code = null;
            user.resetPass.expiresAt = null;
            await user.save();
        } else {
            const seller = await Seller.findById(_id);
            if (!seller) return next(errorModel(404, "User not found"));
            if (seller.resetPass.code === code) return next(errorModel(400, "Invalid Reset Password Code"));
            if (seller.resetPass.expiresAt < Date.now()) return next(errorModel(400, "Code expired"));

            seller.password = hash;
            seller.resetPass.code = null;
            seller.resetPass.expiresAt = null;
            await seller.save();
        }
    } catch (error) { next(error) }
}