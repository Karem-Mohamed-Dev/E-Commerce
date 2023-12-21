const router = require('express').Router();
const isAuth = require("../utils/isAuth.js");
const isAdmin = require("../utils/isAdmin.js");

const { getSubCategorys, createSubCategory, editSubCategory, deleteSubCategory } = require('../controllers/SubCategory.controller.js');

// Get All SubCategorys
router.get('/:categoryId', getSubCategorys);

router.use(isAuth, isAdmin);

// Create SubCategory
router.post('/:categoryId', createSubCategory);

// Edit SubCategory
router.put('/:subId', editSubCategory);

// Delete SubCategory
router.delete('/:subId', deleteSubCategory);

module.exports = router;