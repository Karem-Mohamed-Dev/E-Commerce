const Order = require("../models/Order");
const User = require("../models/User");
const Admin = require("../models/Admin");

// Place Order
exports.placeOrder = async (req,res,next) => {
    res.send("Place Order")
}

// Update Order Status
exports.updateOrderStatus = async (req,res,next) => {
    res.send("Update Order Status")
}

// Order Details
exports.orderDetails = async (req,res,next) => {
    res.send("Order Details")
}

// Get Orders
exports.getOrders = async (req,res,next) => {
    res.send("Get Orders")
}