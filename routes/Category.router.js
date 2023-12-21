const router = require('express').Router();
const isAuth = require("../utils/isAuth.js");
const isAdmin = require("../utils/isAdmin.js");

const { getCategorys, createCategory, editCategory, deleteCategory } = require('../controllers/Category.controller.js');

// Get All Categorys
router.get('/', getCategorys);

router.use(isAuth, isAdmin);

// Create Category
router.post('/', createCategory);

// Edit Category
router.put('/:categoryId', editCategory);

// Delete Category
router.delete('/:categoryId', deleteCategory);

module.exports = router;