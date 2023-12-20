const Seller = require('../models/Seller');
const errorModel = require("./errorModel");

module.exports = async (req, res, next) => {
    const tokenData = req.user;
    if (tokenData.role !== 'seller') return next(errorModel(401, "Not Authorized"));
    const seller = await Seller.findById(tokenData._id);
    if (!seller) return next(errorModel(404, "User Not Found"));
    req.user = seller;
    next();
}