const Admin = require('../models/Admin');
const errorModel = require("./errorModel");

module.exports = async (req, res, next) => {
    const tokenData = req.tokenData;
    if (tokenData.role !== 'admin') return next(errorModel(401, "Not Authorized"));

    try {
        const admin = await Admin.findById(tokenData._id);
        if (!admin) return next(errorModel(404, "Admin Not Found"));
        req.admin = admin;
        next();
    } catch (error) { next(error) }
}