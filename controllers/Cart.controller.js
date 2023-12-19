const Cart = require('../models/Cart');

// Get Cart
exports.getCart = async (req,res,next) => {
    res.send("Get Cart");
}

// Add Item To Cart
exports.addItem = async (req,res,next) => {
    res.send("Add Item To Cart");
}

// Remove Item From Cart
exports.removeItem = async (req,res,next) => {
    res.send("Remove Item From Cart");
}