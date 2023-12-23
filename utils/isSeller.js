const Seller = require('../models/Seller');
const errorModel = require("./errorModel");

module.exports = async (req, res, next) => {
    const tokenData = req.tokenData;
    if (tokenData.role !== 'seller') return next(errorModel(401, "Not Authorized"));

    try {
        const seller = await Seller.findById(tokenData._id, ["-createdAt", "-__v"]);
        if (!seller) return next(errorModel(404, "Seller Not Found"));

        if (!seller.activated) return next(errorModel(400, 'You need to verify your email first'));
        if (seller.ban) return next(errorModel(401, 'You are banned'));

        req.seller = seller;
        next();
    } catch (error) { next(error) }
}