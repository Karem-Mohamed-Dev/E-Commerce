const User = require("../models/User");
const Seller = require("../models/Seller");
const jwt = require("jsonwebtoken");
const errorModel = require("../utils/errorModel");


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
    res.send('getCode')
}

// Verify Reset Password Code
exports.verifyCode = async (req, res, next) => {
    res.send('verifyCode')
}

// Reset Password
exports.resetPass = async (req, res, next) => {
    res.send('resetPass')
}