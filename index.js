require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan("common"));
app.use(helmet());

// Routers Import
const authRouter = require("./routes/Auth.router");
const adminRouter = require("./routes/Admin.router");
const productRouter = require("./routes/Product.router");
const couponRouter = require("./routes/Coupon.router");

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/product', productRouter);
app.use('/api/v1/coupon', couponRouter);

// Not Found
app.use((req, res, next) => res.status(404).json({ msg: "Route not found" }));

// Error
app.use((error, req, res, next) => res.status(error.statusCode || 500).json({ msg: error.msg || "Something went wrong" }));

const start = async () => {
    // await mongoose.connect(process.env.MONGO_URI);
    app.listen(port, console.log("Server Is Running..."));
}
start();