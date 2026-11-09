import db from '../data/db.js';
import ApiError from '../utils/ApiError.js';
import generateId from '../utils/generateId.js';
import cartService from './cart.service.js';
import couponService from './coupon.service.js';

const FREE_DELIVERY_THRESHOLD = 999;
const DELIVERY_FEE = 49;

// Which status can move to which next status
const STATUS_FLOW = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

const findOrder = (orderId) => {
  const order = db.orders.find((o) => o.id === Number(orderId));
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }
  return order;
};

const placeOrder = async (userId, couponCode) => {
  const cart = db.carts.find((c) => c.userId === userId);

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Your cart is empty');
  }

  const items = cart.items;

  // Step 1: make sure every product exists and has enough stock
  for (const item of items) {
    const product = db.products.find((p) => p.id === item.productId);
    if (!product) {
      throw new ApiError(404, `Product ${item.productId} no longer exists`);
    }
    if (product.stock < item.quantity) {
      throw new ApiError(400, `Only ${product.stock} unit(s) of ${product.name} left`);
    }
  }

  // Step 2: save name/price on the order item and reduce stock
  let subtotal = 0;
  for (const item of items) {
    const product = { ...db.products.find((p) => p.id === item.productId) };
    item.name = product.name;
    item.price = product.price;
    product.stock -= item.quantity;
    subtotal += product.price * item.quantity;
  }

  // Step 3: coupon + delivery fee
  let discount = 0;
  if (couponCode) {
    const result = await couponService.redeemCoupon(couponCode, subtotal);
    discount = result.discount;
  }

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;

  const order = {
    id: generateId(db.orders),
    userId,
    items,
    subtotal,
    discount,
    deliveryFee,
    total: subtotal - discount + deliveryFee,
    couponCode: couponCode ? couponCode.toUpperCase() : null,
    status: 'placed',
    createdAt: new Date().toISOString(),
  };

  db.orders.push(order);

  // Order placed, so empty the cart
  await cartService.clearCart(userId);

  return order;
};

const getOrdersByUser = async (userId) => {
  return db.orders
    .filter((o) => o.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const getOrderById = async (orderId, user) => {
  const order = findOrder(orderId);

  // Customers can only see their own orders, admins can see everything
  if (order.userId !== user.id || user.role !== 'admin') {
    throw new ApiError(403, 'You are not allowed to view this order');
  }

  return order;
};

const cancelOrder = async (orderId, user) => {
  const order = findOrder(orderId);

  if (order.userId !== user.id) {
    throw new ApiError(403, 'You can only cancel your own orders');
  }

  if (!STATUS_FLOW[order.status].includes('cancelled')) {
    throw new ApiError(400, `Order cannot be cancelled once it is ${order.status}`);
  }

  // Put the stock back
  for (const item of order.items) {
    const product = db.products.find((p) => p.id === item.productId);
    if (product) {
      product.stock += item.quantity;
    }
  }

  order.status = 'cancelled';
  return order;
};

const updateOrderStatus = async (orderId, newStatus) => {
  const order = findOrder(orderId);

  if (!STATUS_FLOW[newStatus]) {
    throw new ApiError(400, `Unknown status: ${newStatus}`);
  }

  if (!STATUS_FLOW[order.status].includes(newStatus)) {
    throw new ApiError(400, `Cannot change status from ${order.status} to ${newStatus}`);
  }

  order.status = newStatus;
  return order;
};

export default {
  placeOrder,
  getOrdersByUser,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
};
