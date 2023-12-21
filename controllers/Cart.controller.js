const Cart = require("../models/Cart");

// Get Cart
exports.getCart = async (req, res, next) => {
    const user = req.user;

    try {
        const cart = await Cart.find({ user: user._id }).populate('products.product', ["title", "media", "price", "rating"]);
        if (!cart) return res.status(200).json([]);
        res.status(200).json(cart.products);
    } catch (error) { next(error) }
}

// Add Item To Cart
exports.addItem = async (req, res, next) => {
    const user = req.user;
    const { productId } = req.params;
    if (!isMongoId(productId)) return next(errorModel(400, "Please Provide a Valid Product Id"));

    try {
        let cart = await Cart.find({ user: user._id });
        if (!cart) {
            const cartCreate = await Cart.create({ user: user._id });
            cart = cartCreate._doc;
        }

        const index = cart.products.indexOf(ele => ele.product === productId);
        if (index === -1) cart.products.push({ product: productId });
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
        let cart = await Cart.find({ user: user._id });
        if (!cart) return next(errorModel(400, "Cart Not Found"));

        const index = cart.products.indexOf(ele => ele.product === productId);
        if (index === -1) return next(errorModel(400, "Product Not Found"));
        const product = cart.products[index]

        if(product.quantity === 1) cart.products.pull(product);
        else product.quantity -= 1;
        await cart.save();

        res.status(200).json({ msg: "Removed Successful" });
    } catch (error) { next(error) }
}