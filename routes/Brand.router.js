const router = require('express').Router();
const isAuth = require("../utils/isAuth.js");
const isAdmin = require("../utils/isAdmin.js");

const { getBrands, createBrand, editBrand, deleteBrand } = require('../controllers/Brand.controller.js');

// Get All Brands
router.get('/', getBrands);

router.use(isAuth, isAdmin)

// Create Brand
router.post('/', createBrand);

// Edit Brand
router.put('/:brandId', editBrand);

// Delete Brand
router.delete('/:brandId', deleteBrand);

module.exports = router;