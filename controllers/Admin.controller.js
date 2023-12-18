const Admin = require("../models/Admin");

//Admin Login
exports.adminLogin = async (req, res, next) => {
    res.send('Admin Login');
}

// Add Admin
exports.addAdmin = async (req, res, next) => {
    res.send('Add Admin');
}

// Delete Admin
exports.deleteAdmin = async (req, res, next) => {
    res.send('Delete Admin');
}

// User Search
exports.userSearch = async (req, res, next) => {
    res.send('User Search');
}

// Get Warned Users
exports.warned = async (req, res, next) => {
    res.send('Warned Users');
}

// Warn User
exports.warn = async (req, res, next) => {
    res.send('Warn');
}

// UnWarn User
exports.unWarn = async (req, res, next) => {
    res.send('UnWarn');
}

// Ban
exports.ban = async (req, res, next) => {
    res.send('Ban');
}

// Get Banned Users
exports.banned = async (req, res, next) => {
    res.send('banned');
}

// UnBan
exports.unBan = async (req, res, next) => {
    res.send('UnBan');
}

// Reports
exports.reports = async (req, res, next) => {
    res.send('Reports');
}