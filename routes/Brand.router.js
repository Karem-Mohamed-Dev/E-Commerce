const router = require('express').Router();

const { getBrands, createBrand, editBrand, deleteBrand } = require('../controllers/Brand.controller.js');

// Edit Brand
router.put('/:brandId', editBrand);

// Delete Brand
router.delete('/:brandId', deleteBrand);

// Create Brand
router.post('/', createBrand);

// Get All Brands
router.get('/', getBrands);

module.exports = router;