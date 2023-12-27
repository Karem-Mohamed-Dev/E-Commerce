const stripe = require("stripe")(process.env.STRIPE_SECRET);

const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const Seller = require("../models/Seller");

const errorModel = require("../utils/errorModel");
const { isMongoId } = require("validator");

// Place Order
exports.placeOrder = async (req, res, next) => {
    const user = req.user;
    let { stripeToken, phone, country, city, postCode, coupon, payment } = req.body;
    if (!phone || !country || !city || !postCode || !payment) return next(errorModel(400, "Phone, Country, City and Payment Method are Required"));
    if (payment) if (payment !== 'card' && payment !== 'cash') return next(errorModel(400, "Payment must be card or cash"));

    try {
        let validStock = true;
        const cart = await Cart.findOne({ user: user._id }).populate('products.product', ["-__v", "-updatedAt", "-reviews", "-rating", "-sold", "-favorited"]);
        if (!cart) return next(errorModel(404, "Cart not found"));

        cart.products.forEach(ele => {
            if (ele.product.stock < ele.quantity) {
                validStock = false;
                return next(errorModel(400, `Not Enough Stock For ${ele.product.title}`));
            }
        })
        if (!validStock) return;

        let totalPrice = 0;
        cart.products.forEach(ele => totalPrice += ((ele.product.price - ele.product.discount) * ele.quantity).toFixed(2));
        if (coupon) {
            const couponExist = await Coupon.findOne({ code: coupon });
            if (!couponExist) return next(errorModel(404, "Coupon not found"));
            if (couponExist.numOfUses >= couponExist.maxUses || couponExist.expiresAt < Date.now()) {
                await couponExist.deleteOne();
                return next(errorModel(400, "Coupon has been expired"));
            }
            coupon = { code: couponExist.code, discount: couponExist.discount };
            totalPrice -= ((totalPrice / 100) * couponExist.discount).toFixed(2);
            couponExist.numOfUses += 1;
            await couponExist.save();
        }

        const orderData = {
            user: user._id,
            products: cart.products,
            phone: phone,
            address: {
                country: country,
                city: city,
                postCode: postCode
            },
            coupon: coupon || null,
            payment: payment,
            status: "Pending",
            total: +totalPrice
        }

        if (payment === "card") {
            if (!stripeToken) return next(errorModel(400, "Stripe Token Is Required"));
            await stripe.charges.create({
                amount: totalPrice,
                currency: "usd",
                source: stripeToken,
                description: "Order"
            }, (err, result) => {
                if (err) return next(err);
            })
        }

        await Order.create(orderData);
        cart.products.forEach(async (ele) => {
            const total = ele.product.price * ele.quantity;
            const product = await Product.findById(ele.product._id);
            const seller = await Seller.findById(product.seller);
            product.sold += ele.quantity;
            product.stock -= ele.quantity;
            seller.balance += +((total - (total / 100 * 2)) - (ele.product.discount * ele.quantity)).toFixed(2);
            await product.save();
            await seller.save();
        });

        await cart.deleteOne();
        return res.status(200).json(orderData);
    } catch (error) { next(error) }
}

// Update Order Status
exports.updateOrderStatus = async (req, res, next) => {
    const { orderId } = req.params;
    if (!isMongoId(orderId)) return next(errorModel(400, "Invalid Order Id"));
    const { status } = req.body;
    if (!status) return next(errorModel(400, "Status is Required"));

    try {
        const order = await Order.findById(orderId);
        if (!order) return next(errorModel(404, "Order not found"));
        order.status = status
        await order.save();

        res.status(200).json(order);
    } catch (error) { next(error) }
}

// Order Details
exports.orderDetails = async (req, res, next) => {
    const { orderId } = req.params;
    if (!isMongoId(orderId)) return next(errorModel(400, "Invalid Order Id"));

    try {
        const order = await Order.findById(orderId);
        if (!order) return next(errorModel(404, "Order not found"));

        res.status(200).json(order);
    } catch (error) { next(error) }
}

// Get Orders
exports.getOrders = async (req, res, next) => {
    const user = req.user;
    const page = +req.params.page || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    try {
        const orders = await Order.find({ user: user._id })
            .sort("-createdAt").skip(skip).limit(limit);
        if (!orders) return next(errorModel(404, "Orders not found"));

        res.status(200).json({
            result: orders.length,
            pagenationData: {
                currentPage: page,
                totalPages: Math.ceil(orders.length / limit)
            },
            orders
        });
    } catch (error) { next(error) }
}