const router = require('express').Router();

const { getCategorys, createCategory, editCategory, deleteCategory } = require('../controllers/Category.controller.js');

// Edit Category
router.put('/:categoryId', editCategory);

// Delete Category
router.delete('/:categoryId', deleteCategory);

// Create Category
router.post('/', createCategory);

// Get All Categorys
router.get('/', getCategorys);

module.exports = router;