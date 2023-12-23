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

// ----------------------------------------------------------------

// Get Reset Password Code
exports.getUserCode = async (req, res, next) => {
    const { email } = req.body;
    if (!email) return next(errorModel(400, "Email is required"))

    const codeGenerator = () => {
        let result = '';
        for (let i = 0; i < 6; i++)
            result += Math.floor(Math.random() * 10);
        return result;
    }

    try {
        const code = codeGenerator();
        const user = await User.findOne({ email });
        if (!user) return next(errorModel(404, "User not found"));

        user.resetPass = { code, expiresAt: Date.now() + 60 * 60 * 1000 };
        await user.save();
        sendEmail(email, "Password Reset", "Your password reset code is: " + code);

        res.status(200).json({ msg: "Email sent successfully" });
    } catch (error) { next(error) }
}

// Verify Reset Password Code
exports.verifyUserCode = async (req, res, next) => {
    const { code, email } = req.body;
    if (!code || !email) return next(errorModel(400, "Email and Code are required"));

    try {
        const user = await User.findOne({ email });
        if (!user) return next(errorModel(404, "User not found"));

        if (user.resetPass.code !== code) return next(errorModel(400, "Invalid Reset Password Code"));
        if (user.resetPass.expiresAt < Date.now()) return next(errorModel(400, "Code expired"));

        const token = jwt.sign({ _id: user._id, code, role: "user" }, process.env.SECRET, { expiresIn: "1h" });

        res.status(200).json({ token });
    } catch (error) { next(error) }
}

// Reset Password
exports.resetUserPass = async (req, res, next) => {
    const { token, newPass } = req.body;
    if (!token || !newPass) return next(errorModel(400, "Token and New Password are required"))
    if (!isStrongPassword(newPass)) return next(errorModel(400, "Password must be at least 8 with one character upper case and one character lower case and one symbol"));

    try {
        const hash = await bcrypt.hash(newPass, 10);

        const { _id, role, code } = jwt.verify(token, process.env.SECRET);
        if (role !== "user") return next(errorModel(400, "Invalid role"));

        const user = await User.findById(_id);
        if (!user) return next(errorModel(404, "User not found"));

        if (user.resetPass.code !== code) return next(errorModel(400, "Invalid Reset Password Code"));
        if (user.resetPass.expiresAt < Date.now()) return next(errorModel(400, "Code expired"));

        user.password = hash;
        user.resetPass.code = null;
        user.resetPass.expiresAt = null;
        await user.save();

        res.status(200).json({ msg: "Password reset successfully" });
    } catch (error) { next(error) }
}

// ----------------------------------------------------------------

// Get Reset Password Code
exports.getSellerCode = async (req, res, next) => {
    const { email } = req.body;
    if (!email) return next(errorModel(400, "Email is required"))

    const codeGenerator = () => {
        let result = '';
        for (let i = 0; i < 6; i++)
            result += Math.floor(Math.random() * 10);
        return result;
    }

    try {
        const code = codeGenerator();
        const seller = await Seller.findOne({ email });
        if (!seller) return next(errorModel(404, "Seller not found"));

        seller.resetPass = { code, expiresAt: Date.now() + 60 * 60 * 1000 };
        await seller.save();
        sendEmail(email, "Password Reset", "Your password reset code is: " + code);

        res.status(200).json({ msg: "Email sent successfully" });
    } catch (error) { next(error) }
}

// Verify Reset Password Code
exports.verifySellerCode = async (req, res, next) => {
    const { code, email } = req.body;
    if (!code || !email) return next(errorModel(400, "Email and Code are required"));

    try {
        const seller = await Seller.findOne({ email });
        if (!seller) return next(errorModel(404, "Seller not found"));

        if (seller.resetPass.code !== code) return next(errorModel(400, "Invalid Reset Password Code"));
        if (seller.resetPass.expiresAt < Date.now()) return next(errorModel(400, "Code expired"));

        const token = jwt.sign({ _id: seller._id, code, role: "seller" }, process.env.SECRET, { expiresIn: "1h" });

        res.status(200).json({ token });
    } catch (error) { next(error) }
}

// Reset Password
exports.resetSellerPass = async (req, res, next) => {
    const { token, newPass } = req.body;
    if (!token || !newPass) return next(errorModel(400, "Token and New Password are required"))
    if (!isStrongPassword(newPass)) return next(errorModel(400, "Password must be at least 8 with one character upper case and one character lower case and one symbol"));

    try {
        const hash = await bcrypt.hash(newPass, 10);

        const { _id, role, code } = jwt.verify(token, process.env.SECRET);
        if (role !== "seller") return next(errorModel(404, "Invalid role"));

        const seller = await Seller.findById(_id);
        if (!seller) return next(errorModel(404, "User not found"));

        if (seller.resetPass.code !== code) return next(errorModel(400, "Invalid Reset Password Code"));
        if (seller.resetPass.expiresAt < Date.now()) return next(errorModel(400, "Code expired"));

        seller.password = hash;
        seller.resetPass.code = null;
        seller.resetPass.expiresAt = null;
        await seller.save();

        res.status(200).json({ msg: "Password reset successfully" });
    } catch (error) { next(error) }
}