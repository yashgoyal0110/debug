import express from 'express';
import couponController from '../controllers/coupon.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', couponController.getActiveCoupons);
router.post('/validate', protect, couponController.validateCoupon);

export default router;
