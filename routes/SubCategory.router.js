const router = require('express').Router();

const { getSubCategorys, createSubCategory, editSubCategory, deleteSubCategory } = require('../controllers/SubCategory.controller.js');

// Edit SubCategory
router.put('/:subId', editSubCategory);

// Delete SubCategory
router.delete('/:subId', deleteSubCategory);

// Create SubCategory
router.post('/:categoryId', createSubCategory);

// Get All SubCategorys
router.get('/:categoryId', getSubCategorys);

module.exports = router;