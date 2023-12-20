const User = require('../models/User');
const errorModel = require("./errorModel");

module.exports = async (req, res, next) => {
    const tokenData = req.user;
    if (tokenData.role !== 'user') return next(errorModel(401, "Not Authorized"));
    const user = await User.findById(tokenData._id);
    if (!user) return next(errorModel(404, "User Not Found"));
    req.user = user;
    next();
}