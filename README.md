# ShopKart API 🛒

A small e-commerce backend built with **Node.js + Express**, following a standard
**Routes → Controllers → Services** architecture.

There is **no real MongoDB**. Each "collection" is a plain JavaScript array in
[`src/data/db.js`](src/data/db.js). Data is stored in memory, so **restarting the
server resets everything**.

> 🐞 This project has **10 known bugs**. Your job is to find and fix them.
> See [`issues.md`](issues.md).

---

## Getting started

```bash
npm install
npm run dev      # starts with nodemon (auto restart)
# or
npm start
```

The server runs on `http://localhost:3000`.

---

## Project structure

```
src/
├── server.js                 # starts the HTTP server
├── app.js                    # express app, middlewares, routes
├── data/
│   └── db.js                 # in-memory "database" (users, products, carts, orders, coupons)
├── routes/                   # URL → controller mapping
├── controllers/              # reads req, calls service, sends res
├── services/                 # business logic + "database" access
├── middlewares/
│   ├── auth.middleware.js    # protect (login check) + authorize (role check)
│   └── error.middleware.js   # 404 handler + central error handler
└── utils/
    ├── ApiError.js           # error class with statusCode
    ├── asyncHandler.js       # forwards async errors to next()
    └── generateId.js         # auto-increment id helper
```

**Request flow:** `route` → `middleware (auth)` → `controller` → `service` → `db.js`
If a service throws an `ApiError`, the `errorHandler` middleware turns it into a JSON response.

---

## Authentication

Auth is kept simple on purpose (no JWT/bcrypt). Every user has a fixed token.
Send it in the header:

```
Authorization: Bearer <token>
```

| User         | Email                | Password | Role     | Token             |
| ------------ | -------------------- | -------- | -------- | ----------------- |
| Aisha Khan   | admin@shopkart.com   | admin123 | admin    | `admin-token-111` |
| Rahul Verma  | rahul@mail.com       | rahul123 | customer | `rahul-token-222` |
| Priya Sharma | priya@mail.com       | priya123 | customer | `priya-token-333` |

---

## API endpoints

All responses look like `{ "success": true, "data": ... }` or `{ "success": false, "message": "..." }`.

### Auth
| Method | Endpoint          | Auth | Body                  |
| ------ | ----------------- | ---- | --------------------- |
| POST   | `/api/auth/login` | ❌   | `{ email, password }` |
| GET    | `/api/auth/me`    | ✅   |                       |

### Products
| Method | Endpoint            | Auth     | Notes |
| ------ | ------------------- | -------- | ----- |
| GET    | `/api/products`     | ❌       | Query: `category`, `search`, `sort` (`price_asc` / `price_desc` / `rating`), `page` (starts at 1), `limit` (default 5) |
| GET    | `/api/products/:id` | ❌       | |
| POST   | `/api/products`     | 🔒 admin | `{ name, category, price, stock }` |
| PATCH  | `/api/products/:id` | 🔒 admin | `{ name?, price?, stock? }` |

### Cart
| Method | Endpoint                    | Auth | Body                       |
| ------ | --------------------------- | ---- | -------------------------- |
| GET    | `/api/cart`                 | ✅   |                            |
| POST   | `/api/cart/items`           | ✅   | `{ productId, quantity }`  |
| PATCH  | `/api/cart/items/:productId`| ✅   | `{ quantity }`             |
| DELETE | `/api/cart/items/:productId`| ✅   |                            |
| DELETE | `/api/cart`                 | ✅   |                            |

### Orders
| Method | Endpoint                 | Auth     | Body                |
| ------ | ------------------------ | -------- | ------------------- |
| POST   | `/api/orders`            | ✅       | `{ couponCode? }` (places an order from the cart) |
| GET    | `/api/orders`            | ✅       | logged-in user's orders |
| GET    | `/api/orders/:id`        | ✅       | owner or admin only |
| PATCH  | `/api/orders/:id/cancel` | ✅       | owner only, only while `placed` / `confirmed` |
| PATCH  | `/api/orders/:id/status` | 🔒 admin | `{ status }` |

Order status flow: `placed → confirmed → shipped → delivered` (`placed` / `confirmed` can also go to `cancelled`).

Delivery fee: ₹49, **free** if the subtotal is ₹999 or more.

### Coupons
| Method | Endpoint                | Auth | Body                      |
| ------ | ----------------------- | ---- | ------------------------- |
| GET    | `/api/coupons`          | ❌   | lists active coupons      |
| POST   | `/api/coupons/validate` | ✅   | `{ code, orderAmount }`   |

---

## Example requests (curl)

```bash
# login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rahul@mail.com","password":"rahul123"}'

# add to cart
curl -X POST http://localhost:3000/api/cart/items \
  -H "Authorization: Bearer rahul-token-222" \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 2}'

# place order with coupon
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer rahul-token-222" \
  -H "Content-Type: application/json" \
  -d '{"couponCode": "WELCOME10"}'
```

You can also use Postman / Thunder Client / Insomnia.
