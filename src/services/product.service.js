import db from '../data/db.js';
import ApiError from '../utils/ApiError.js';
import generateId from '../utils/generateId.js';

const ALLOWED_CATEGORIES = ['electronics', 'fashion', 'home', 'fitness'];

/**
 * Supports: ?category=  ?search=  ?sort=price_asc|price_desc|rating  ?page=  ?limit=
 */
const getAllProducts = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 5;
  const { category, search, sort } = query;

  let result = db.products;

  if (category) {
    result = result.filter((p) => p.category === category.toLowerCase());
  }

  if (search) {
    const term = search.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(term));
  }

  if (sort === 'price_asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    result.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    result.sort((a, b) => b.rating - a.rating);
  }

  const total = result.length;
  const start = page * limit;
  const items = result.slice(start, start + limit);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getProductById = async (id) => {
  const product = db.products.find((p) => p.id === id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  return product;
};

const createProduct = async ({ name, category, price, stock }) => {
  if (!name || !category || price === undefined || stock === undefined) {
    throw new ApiError(400, 'name, category, price and stock are required');
  }
  if (!ALLOWED_CATEGORIES.includes(category)) {
    throw new ApiError(400, `category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`);
  }
  if (typeof price !== 'number' || price <= 0) {
    throw new ApiError(400, 'price must be a positive number');
  }
  if (!Number.isInteger(stock) || stock < 0) {
    throw new ApiError(400, 'stock must be a non-negative integer');
  }

  const product = {
    id: generateId(db.products),
    name: name.trim(),
    category,
    price,
    stock,
    rating: 0,
  };

  db.products.push(product);
  return product;
};

const updateProduct = async (id, updates) => {
  const product = await getProductById(id);

  if (updates.price !== undefined) {
    if (typeof updates.price !== 'number' || updates.price <= 0) {
      throw new ApiError(400, 'price must be a positive number');
    }
    product.price = updates.price;
  }

  if (updates.stock !== undefined) {
    if (!Number.isInteger(updates.stock) || updates.stock < 0) {
      throw new ApiError(400, 'stock must be a non-negative integer');
    }
    product.stock = updates.stock;
  }

  if (updates.name) {
    product.name = updates.name.trim();
  }

  return product;
};

export default { getAllProducts, getProductById, createProduct, updateProduct };
