import express from 'express';
import cartController from '../controllers/cart.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Every cart route needs a logged-in user
router.use(protect);

router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.patch('/items/:productid', cartController.updateItem);
router.delete('/items/:productId', cartController.removeItem);
router.delete('/', cartController.clearCart);

export default router;
