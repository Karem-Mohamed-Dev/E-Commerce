const router = require('express').Router();
const isAdmin = require("../utils/isAdmin.js");
const isAuth = require("../utils/isAuth.js");

const { adminLogin, addAdmin, deleteAdmin, sellerSearch, ban, banned, unBan, warned, warn, unWarn, reports } = require("../controllers/Admin.controller.js");


// Login Admin
router.post("/login", adminLogin);

// Admin Route Protection
router.use(isAuth, isAdmin);

// ----------------------------------------------------------------

// Search For Seller
router.get("/search", sellerSearch);

// ----------------------------------------------------------------

// Get Warned Sellers
router.get("/warned", warned);

// Warn Seller
router.post("/warn/:sellerId", warn);

// Remove Warn From Seller
router.post("/unwarn/:sellerId", unWarn);

// ----------------------------------------------------------------

// Get Banned Sellers
router.get("/banned", banned);

// Ban Seller
router.post("/ban/:sellerId", ban);

// UnBan Seller
router.post("/unban/:sellerId", unBan);

// ----------------------------------------------------------------

// Get Reports
router.get("/reports", reports);

// Add Admin
router.post("/", addAdmin);

// Remove Admin
router.delete("/:adminId", deleteAdmin);

module.exports = router;