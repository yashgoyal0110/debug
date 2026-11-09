import asyncHandler from '../utils/asyncHandler.js';
import couponService from '../services/coupon.service.js';

// GET /api/coupons
const getActiveCoupons = asyncHandler(async (req, res) => {
  const coupons = await couponService.getActiveCoupons();
  res.status(200).json({ success: true, data: coupons });
});

// POST /api/coupons/validate   body: { code, orderAmount }
// Only checks the coupon (does NOT mark it as used)
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;
  const result = await couponService.validateCoupon(code, Number(orderAmount));
  res.status(200).json({ success: true, data: result });
});

export default { getActiveCoupons, validateCoupon };
