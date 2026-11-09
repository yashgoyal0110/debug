/**
 * In-memory "database".
 *
 * Each array below plays the role of a MongoDB collection.
 * Data lives only in memory, so every server restart resets it.
 */

const users = [
  {
    id: 1,
    name: 'Aisha Khan',
    email: 'admin@shopkart.com',
    password: 'admin123', // plain text only because this is a practice project!
    role: 'admin',
    token: 'admin-token-111',
  },
  {
    id: 2,
    name: 'Rahul Verma',
    email: 'rahul@mail.com',
    password: 'rahul123',
    role: 'customer',
    token: 'rahul-token-222',
  },
  {
    id: 3,
    name: 'Priya Sharma',
    email: 'priya@mail.com',
    password: 'priya123',
    role: 'customer',
    token: 'priya-token-333',
  },
];

const products = [
  { id: 1, name: 'Wireless Mouse', category: 'electronics', price: 799, stock: 25, rating: 4.3 },
  { id: 2, name: 'Mechanical Keyboard', category: 'electronics', price: 3499, stock: 10, rating: 4.7 },
  { id: 3, name: 'Cotton T-Shirt', category: 'fashion', price: 499, stock: 50, rating: 4.1 },
  { id: 4, name: 'Running Shoes', category: 'fashion', price: 2599, stock: 8, rating: 4.5 },
  { id: 5, name: 'Steel Water Bottle', category: 'home', price: 349, stock: 40, rating: 4.0 },
  { id: 6, name: 'Table Lamp', category: 'home', price: 1199, stock: 3, rating: 3.9 },
  { id: 7, name: 'USB-C Charger', category: 'electronics', price: 1299, stock: 2, rating: 4.4 },
  { id: 8, name: 'Denim Jacket', category: 'fashion', price: 2199, stock: 12, rating: 4.2 },
  { id: 9, name: 'Coffee Mug', category: 'home', price: 299, stock: 60, rating: 4.6 },
  { id: 10, name: 'Bluetooth Speaker', category: 'electronics', price: 1899, stock: 15, rating: 4.1 },
  { id: 11, name: 'Yoga Mat', category: 'fitness', price: 899, stock: 20, rating: 4.4 },
  { id: 12, name: 'Dumbbell Set', category: 'fitness', price: 2999, stock: 5, rating: 4.8 },
];

// One cart per user: { userId, items: [{ productId, quantity }] }
const carts = [
  {
    userId: 2,
    items: [{ productId: 3, quantity: 2 }],
  },
];

const orders = [
  {
    id: 1,
    userId: 3,
    items: [{ productId: 9, name: 'Coffee Mug', price: 299, quantity: 2 }],
    subtotal: 598,
    discount: 0,
    deliveryFee: 49,
    total: 647,
    couponCode: null,
    status: 'delivered',
    createdAt: '2026-10-01T10:30:00.000Z',
  },
];

const coupons = [
  {
    code: 'WELCOME10',
    type: 'percent', // 10% off
    value: 10,
    maxDiscount: 300,
    minOrderAmount: 500,
    expiresAt: '2030-12-31',
    usageLimit: 100,
    usedCount: 12,
    isActive: true,
  },
  {
    code: 'FLAT200',
    type: 'flat', // ₹200 off
    value: 200,
    maxDiscount: null,
    minOrderAmount: 1500,
    expiresAt: '2030-06-30',
    usageLimit: 50,
    usedCount: 50, // already fully used
    isActive: true,
  },
  {
    code: 'DIWALI50',
    type: 'percent',
    value: 50,
    maxDiscount: 1000,
    minOrderAmount: 1000,
    expiresAt: '2024-11-05', // expired
    usageLimit: 500,
    usedCount: 230,
    isActive: true,
  },
];

export default { users, products, carts, orders, coupons };
