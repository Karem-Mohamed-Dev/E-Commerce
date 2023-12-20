const User = require('../models/User');
const errorModel = require("./errorModel");

module.exports = async (req, res, next) => {
    const tokenData = req.user;
    if (tokenData.role !== 'user') return next(errorModel(401, "Not Authorized"));

    try {
        const user = await User.findById(tokenData._id);
        if (!user) return next(errorModel(404, "User Not Found"));

        if (!user.activated) return next(errorModel(400, 'You need to verify your email first'));
        if (user.ban) return next(errorModel(401, 'You are banned'));

        req.user = user;
        next();
    } catch (error) { next(error) }
}