import asyncHandler from '../utils/asyncHandler.js';
import orderService from '../services/order.service.js';

// POST /api/orders   body: { couponCode? }
const placeOrder = asyncHandler(async (req, res) => {
  const order = await orderService.placeOrder(req.user.id, req.body.couponCode);
  res.status(201).json({ success: true, data: order });
});

// GET /api/orders
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = orderService.getOrdersByUser(req.user.id);
  res.status(200).json({ success: true, count: orders.length, data: orders });
});

// GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user);
  res.status(200).json({ success: true, data: order });
});

// PATCH /api/orders/:id/cancel
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(req.params.id, req.user);
  res.status(200).json({ success: true, data: order });
});

// PATCH /api/orders/:id/status   body: { status }  (admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
  res.status(200).json({ success: true, data: order });
});

export default { placeOrder, getMyOrders, getOrderById, cancelOrder, updateOrderStatus };
