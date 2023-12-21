const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { isMongoId } = require("validator");
const errorModel = require("../utils/errorModel");
// Get Cart
exports.getCart = async (req, res, next) => {
    const user = req.user;

    try {
        const cart = await Cart.findOne({ user: user._id })
        if (!cart) return res.status(200).json([]);
        res.status(200).json(cart);
    } catch (error) { next(error) }
}

// Add Item To Cart
exports.addItem = async (req, res, next) => {
    const user = req.user;
    const { productId } = req.params;
    if (!isMongoId(productId)) return next(errorModel(400, "Please Provide a Valid Product Id"));

    try {
        let cart = await Cart.findOne({ user: user._id });
        const product = await Product.findOne({ productId });
        if(!product) return next(errorModel(400, "Couldn't find Product"));

        if (!cart) {
            await Cart.create({ user: user._id, products: [{ product: productId, quantity: 1 }] });
            return res.status(200).json({ msg: "Add Successful" });
        }

        const index = cart.products.findIndex(ele => ele.product.toString() === productId);
        if (index === -1) cart.products.push({ product: productId, quantity: 1 });
        else cart.products[index].quantity += 1;
        await cart.save();

        res.status(200).json({ msg: "Add Successful" });
    } catch (error) { next(error) }
}

// Remove Item From Cart
exports.removeItem = async (req, res, next) => {
    const user = req.user;
    const { productId } = req.params;
    if (!isMongoId(productId)) return next(errorModel(400, "Please Provide a Valid Product Id"));

    try {
        let cart = await Cart.findOne({ user: user._id });
        if (!cart) return next(errorModel(400, "Cart Not Found"));

        const index = cart.products.findIndex(ele => ele.product.toString() === productId);
        if (index === -1) return next(errorModel(400, "Product Not Found"));
        const product = cart.products[index];

        if (product.quantity === 1) cart.products.pull(product);
        else product.quantity -= 1;

        if(cart.products.length > 0) await cart.save();
        else await cart.deleteOne();

        res.status(200).json({ msg: "Removed Successful" });
    } catch (error) { next(error) }
}