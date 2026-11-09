import express from 'express';
import productController from '../controllers/product.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Admin only
router.post('/', protect, authorize('admin'), productController.createProduct);
router.patch('/:id', protect, authorize('admin'), productController.updateProduct);

export default router;
