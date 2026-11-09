import db from '../data/db.js';
import ApiError from '../utils/ApiError.js';

const getActiveCoupons = async () => {
  return db.coupons
    .filter((c) => c.isActive && new Date(c.expiresAt) > new Date())
    .map((c) => ({
      code: c.code,
      type: c.type,
      value: c.value,
      minOrderAmount: c.minOrderAmount,
      expiresAt: c.expiresAt,
    }));
};

const calculateDiscount = (coupon, orderAmount) => {
  if (coupon.type === 'flat') {
    return Math.min(coupon.value, orderAmount);
  }

  // percent
  const discount = Math.round((orderAmount * coupon.value) / 100);
  return coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount;
};

/**
 * Checks if a coupon can be used for the given order amount.
 * Returns { code, discount } or throws an ApiError.
 */
const validateCoupon = async (code, orderAmount) => {
  if (!code) {
    throw new ApiError(400, 'Coupon code is required');
  }

  const coupon = db.coupons.find((c) => c.code === code.toUpperCase().trim());

  if (!coupon || !coupon.isActive) {
    throw new ApiError(404, 'Invalid coupon code');
  }

  if (coupon.expiresAt < Date.now()) {
    throw new ApiError(400, 'This coupon has expired');
  }

  if (coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, 'This coupon has reached its usage limit');
  }

  if (orderAmount < coupon.minOrderAmount) {
    throw new ApiError(400, `Minimum order amount for this coupon is ₹${coupon.minOrderAmount}`);
  }

  return { code: coupon.code, discount: calculateDiscount(coupon, orderAmount) };
};

// Validates AND marks the coupon as used (call only when an order is placed)
const redeemCoupon = async (code, orderAmount) => {
  const result = await validateCoupon(code, orderAmount);
  const coupon = db.coupons.find((c) => c.code === result.code);
  coupon.usedCount += 1;
  return result;
};

export default { getActiveCoupons, validateCoupon, redeemCoupon };
