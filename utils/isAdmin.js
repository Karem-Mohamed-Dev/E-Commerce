const Admin = require('../models/Admin');
const errorModel = require("./errorModel");

module.exports = async (req, res, next) => {
    const tokenData = req.user;
    if (tokenData.role !== 'admin') return next(errorModel(401, "Not Authorized"));
    const admin = await Admin.findById(tokenData._id);
    if (!admin) return next(errorModel(404, "User Not Found"));
    req.user = admin;
    next();
}