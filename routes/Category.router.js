const router = require('express').Router();
const isAuth = require("../utils/isAuth.js");
const isAdmin = require("../utils/isAdmin.js");
const { upload } = require("../utils/upload.js");

const { getCategorys, createCategory, editCategory, deleteCategory } = require('../controllers/Category.controller.js');

// Get All Categorys
router.get('/', getCategorys);

router.use(isAuth, isAdmin);

// Create Category
router.post('/', upload.single('image'), createCategory);

// Edit Category
router.put('/:categoryId', upload.single('image'), editCategory);

// Delete Category
router.delete('/:categoryId', deleteCategory);

module.exports = router;