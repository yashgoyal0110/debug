import asyncHandler from '../utils/asyncHandler.js';
import productService from '../services/product.service.js';

// GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const result = await productService.getAllProducts(req.query);
  res.status(200).json({ success: true, ...result });
});

// GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.status(200).json({ success: true, data: product });
});

// POST /api/products  (admin)
const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json({ success: true, data: product });
});

// PATCH /api/products/:id  (admin)
const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.status(200).json({ success: true, data: product });
});

export default { getProducts, getProductById, createProduct, updateProduct };
