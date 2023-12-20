const router = require('express').Router();
const isAdmin = require("../utils/isAdmin.js");

const { adminLogin, addAdmin, deleteAdmin, userSearch, ban, banned, unBan, warned, warn, unWarn, reports } = require("../controllers/Admin.controller.js");


// Login Admin
router.post("/login", adminLogin);

// Remove Admin
router.delete("/:adminId", deleteAdmin);

// ----------------------------------------------------------------

// Admin Route Protection
app.use(isAdmin);

// ----------------------------------------------------------------

// Search For User
router.get("/search", userSearch);

// ----------------------------------------------------------------

// Get Warned Users
router.get("/warned", warned);

// Warn User
router.post("/warn/:userId", warn);

// Remove Warn From User
router.post("/unwarn/:userId", unWarn);

// ----------------------------------------------------------------

// Get Banned Users
router.get("/banned", banned);

// Ban User
router.post("/ban/:userId", ban);

// UnBan User
router.post("/unban/:userId", unBan);

// ----------------------------------------------------------------

// Get Reports
router.get("/reports", reports);

// Add Admin
router.post("/", addAdmin);

module.exports = router;