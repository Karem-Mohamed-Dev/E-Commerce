const router = require('express').Router();

const { adminLogin, addAdmin, deleteAdmin, userSearch, ban, banned, unBan, warned, warn, unWarn, reports } = require("../controllers/Admin.controller.js");

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

// ----------------------------------------------------------------

// Login Admin
router.post("/login", adminLogin);

// Remove Admin
router.delete("/:adminId", deleteAdmin);

// Add Admin
router.post("/", addAdmin);

module.exports = router;