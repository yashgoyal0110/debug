import db from '../data/db.js';
import ApiError from '../utils/ApiError.js';

const findProduct = (productId) => db.products.find((p) => p.id === Number(productId));

const getOrCreateCart = (userId) => {
  let cart = db.carts.find((c) => c.userId === userId);

  if (!cart) {
    cart = { userId, items: [] };
    db.carts.push(cart);
  }

  return cart;
};

// Converts the raw cart into a response with names, prices and totals
const buildCartResponse = (cart) => {
  const items = cart.items.map((item) => {
    const product = findProduct(item.productId);
    return {
      productId: item.productId,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      lineTotal: product.price * item.quantity,
    };
  });

  const totalItems = items.reduce((count, item) => count + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.lineTotal);

  return { items, totalItems, total };
};

const validateQuantity = (quantity) => {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new ApiError(400, 'quantity must be a whole number greater than 0');
  }
};

const getCart = async (userId) => {
  const cart = getOrCreateCart(userId);
  return buildCartResponse(cart);
};

const addItem = async (userId, productId, quantity = 1) => {
  validateQuantity(quantity);

  const product = findProduct(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const cart = getOrCreateCart(userId);
  const existing = cart.items.find((item) => item.productId === product.id);
  const newQuantity = existing ? existing.quantity + quantity : quantity;

  if (newQuantity > product.stock) {
    throw new ApiError(400, `Only ${product.stock} unit(s) of ${product.name} available`);
  }

  if (existing) {
    existing.quantity = newQuantity;
  } else {
    cart.items.push({ productId: product.id, quantity });
  }

  return buildCartResponse(cart);
};

const updateItem = async (userId, productId, quantity) => {
  validateQuantity(quantity);

  const cart = getOrCreateCart(userId);
  const item = cart.items.find((i) => i.productId === Number(productId));

  if (!item) {
    throw new ApiError(404, 'Item not found in cart');
  }

  const product = findProduct(productId);
  if (quantity > product.stock) {
    throw new ApiError(400, `Only ${product.stock} unit(s) of ${product.name} available`);
  }

  item.quantity = quantity;
  return buildCartResponse(cart);
};

const removeItem = async (userId, productId) => {
  const cart = getOrCreateCart(userId);
  const index = cart.items.findIndex((i) => i.productId === Number(productId));

  if (index === -1) {
    throw new ApiError(404, 'Item not found in cart');
  }

  cart.items.splice(index, 1);
  return buildCartResponse(cart);
};

const clearCart = async (userId) => {
  const cart = getOrCreateCart(userId);
  cart.items.length = 0;
  return { items: [], totalItems: 0, total: 0 };
};

export default { getCart, addItem, updateItem, removeItem, clearCart };
