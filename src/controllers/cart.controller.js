import asyncHandler from '../utils/asyncHandler.js';
import cartService from '../services/cart.service.js';

// GET /api/cart
const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user.id);
  res.status(200).json({ success: true, data: cart });
});

// POST /api/cart/items   body: { productId, quantity }
const addItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await cartService.addItem(req.user.id, productId, quantity);
  res.status(200).json({ success: true, data: cart });
});

// PATCH /api/cart/items/:productId   body: { quantity }
const updateItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateItem(req.user.id, req.params.productId, req.body.quantity);
  res.status(200).json({ success: true, data: cart });
});

// DELETE /api/cart/items/:productId
const removeItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItem(req.user.id, req.params.productId);
  res.status(200).json({ success: true, data: cart });
});

// DELETE /api/cart
const clearCart = asyncHandler(async (req, res) => {
  const cart = await cartService.clearCart(req.user.id);
  res.status(200).json({ success: true, data: cart });
});

export default { getCart, addItem, updateItem, removeItem, clearCart };
