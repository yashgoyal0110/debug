# 🐞 ShopKart: Bug Tracker

Welcome, debugger! QA and real customers have reported the issues below.
Your job is to **find the root cause and fix each one**.

| Difficulty | Count |
| ---------- | ----- |
| 🟢 Easy    | 3     |
| 🟡 Medium  | 5     |
| 🔴 Hard    | 2     |

## Rules

1. **Do not change the data in `src/data/db.js`.** The bugs are in the code, not the data.
2. Each bug can be fixed with a **small change** (usually 1–3 lines). Don't rewrite whole files.
3. Restart the server after each fix (or use `npm run dev`). Data resets on restart, so start each
   reproduction from a fresh server.
4. For each bug, write down:
   - **Root cause:** what was actually wrong, and why
   - **Fix:** what you changed (file + line)
   - **How you verified it:** the request you ran and the response you got
5. **The bugs are independent.** Fix them in **any order**. Every "Steps to reproduce" works on a
   fresh server, no matter which other bugs are already fixed.

## Debugging tips

- Read the **terminal** where the server is running. Error stack traces show the file and line.
- Follow the flow: `route → controller → service → db.js`.
- Use `console.log()` freely, then remove it once you're done.
- Ask yourself: *"What did I expect this value to be? What is it actually?"*

Test accounts and tokens are in the [README](README.md#authentication).

---

## 🟢 BUG-01: Can't change item quantity in the cart

**Difficulty:** Easy  **Area:** Cart / routing

**Reported by:** Customer (Rahul)

> "I have T-shirts in my cart. When I press **+** to change the quantity, it says the item is
> not in my cart. But it's right there!"

**Steps to reproduce**
```bash
# Rahul's cart already has product 3 (Cotton T-Shirt)
curl -X PATCH http://localhost:3000/api/cart/items/3 \
  -H "Authorization: Bearer rahul-token-222" -H "Content-Type: application/json" \
  -d '{"quantity": 5}'
```

**Expected:** `200` with the T-shirt quantity updated to `5`.

**Actual:**
```json
{ "success": false, "message": "Item not found in cart" }
```

<details>
<summary>💡 Hint</summary>

Add `console.log(req.params)` at the top of the `updateItem` controller. Is the value you
expect actually there? Now compare the route definition with the controller **character by character**.
</details>

---

## 🟢 BUG-02: Every single product page says "Product not found"

**Difficulty:** Easy  **Area:** Products

**Reported by:** Frontend team

> "The product listing works, but when a user clicks on any product, the details page always
> shows *Product not found*, even for products we can see in the list."

**Steps to reproduce**
```bash
curl http://localhost:3000/api/products/2
```

**Expected:** `200` with the *Mechanical Keyboard* product.

**Actual:**
```json
{ "success": false, "message": "Product not found" }
```

Admins report the same problem with `PATCH /api/products/:id`.

<details>
<summary>💡 Hint</summary>

Log `id` and `typeof id` inside the service. What type is a URL parameter?
What type are the ids in `db.js`?
</details>

---

## 🟢 BUG-03: First page of products skips items

**Difficulty:** Easy  **Area:** Products / pagination

**Reported by:** Customer

> "I never see the Wireless Mouse or the Keyboard on the shop's homepage, but I can find them
> by searching. Also, the *fashion* category page is completely empty!"

**Steps to reproduce**
```bash
curl "http://localhost:3000/api/products?page=1&limit=5"
curl "http://localhost:3000/api/products?category=fashion"
```

**Expected:** Page 1 shows products with ids `1, 2, 3, 4, 5`. The fashion category shows 3 products.

**Actual:** Page 1 shows ids `6, 7, 8, 9, 10`. The fashion category returns `"items": []`
even though `"total": 3`.

<details>
<summary>💡 Hint</summary>

Pages start at **1**. Work out on paper which index `slice()` should start from for page 1,
page 2 and page 3.
</details>

---

## 🟡 BUG-04: Cart total is broken, and an empty cart crashes

**Difficulty:** Medium  **Area:** Cart

**Reported by:** QA team

> "The cart total shows weird values. Sometimes it's an object, sometimes it's text like
> `[object Object]799`. And a brand-new user who opens their cart gets a 500 error."

**Steps to reproduce**
```bash
# Rahul has 1 item in his cart already
curl http://localhost:3000/api/cart -H "Authorization: Bearer rahul-token-222"

# add a second item
curl -X POST http://localhost:3000/api/cart/items \
  -H "Authorization: Bearer rahul-token-222" -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 1}'

# Priya has no cart yet
curl http://localhost:3000/api/cart -H "Authorization: Bearer priya-token-333"
```

**Expected:** `total` is a number (`998`, then `1797`). Priya gets an empty cart with `total: 0`.

**Actual:**
- 1 item → `"total": { "productId": 3, "name": "Cotton T-Shirt", ... }`
- 2 items → `"total": "[object Object]799"`
- Empty cart → `500 Internal server error`, and the terminal shows
  `TypeError: Reduce of empty array with no initial value`

Note that `totalItems` is always correct. Why does that one work?

<details>
<summary>💡 Hint</summary>

Read the MDN docs for `Array.prototype.reduce()`. What happens when you don't pass the
second argument?
</details>

---

## 🟡 BUG-05: Expired coupons still give discounts

**Difficulty:** Medium  **Area:** Coupons

**Reported by:** Finance team 💸

> "The DIWALI50 sale ended in **2024**, but customers are still getting 50% off with it!
> We are losing money on every order."

**Steps to reproduce**
```bash
curl -X POST http://localhost:3000/api/coupons/validate \
  -H "Authorization: Bearer rahul-token-222" -H "Content-Type: application/json" \
  -d '{"code": "DIWALI50", "orderAmount": 2000}'
```

**Expected:** `400 This coupon has expired`

**Actual:**
```json
{ "success": true, "data": { "code": "DIWALI50", "discount": 1000 } }
```

Interestingly, `GET /api/coupons` correctly does **not** list DIWALI50 as active.

<details>
<summary>💡 Hint</summary>

Try `console.log(coupon.expiresAt, Date.now(), coupon.expiresAt < Date.now())`.
What happens when JavaScript compares a **string** with a **number**? Compare this check with the
one in `getActiveCoupons`.
</details>

---

## 🟡 BUG-06: "My Orders" page is always empty

**Difficulty:** Medium  **Area:** Orders

**Reported by:** Customer (Priya)

> "I've definitely ordered before (I got my coffee mugs!), but My Orders shows nothing."

**Steps to reproduce**
```bash
curl http://localhost:3000/api/orders -H "Authorization: Bearer priya-token-333"
```

**Expected:**
```json
{ "success": true, "count": 1, "data": [ { "id": 1, ... } ] }
```

**Actual:**
```json
{ "success": true, "data": {} }
```

No error appears anywhere. Notice that `count` is missing completely and `data` is an **object**,
not an array.

<details>
<summary>💡 Hint</summary>

The service function is `async`. What does an `async` function return when you call it?
What does `JSON.stringify()` turn that into?
</details>

---

## 🟡 BUG-07: Nobody can view order details, not even admins

**Difficulty:** Medium  **Area:** Orders / authorization

**Reported by:** Customer support

> "Customers can't open their own orders, and we (admins) can't open any customer order either.
> Everyone gets *You are not allowed to view this order*."

**Steps to reproduce**
```bash
# Priya opens her own order
curl http://localhost:3000/api/orders/1 -H "Authorization: Bearer priya-token-333"

# Admin opens Priya's order
curl http://localhost:3000/api/orders/1 -H "Authorization: Bearer admin-token-111"
```

**Expected**

| Who            | Order 1 (Priya's) |
| -------------- | ----------------- |
| Priya (owner)  | ✅ 200            |
| Admin          | ✅ 200            |
| Rahul (other)  | ❌ 403            |

**Actual:** Priya and Admin both get `403`.

<details>
<summary>💡 Hint</summary>

Write a small truth table for the `if` condition with the three users above.
When should the request be **blocked**?
</details>

---

## 🟡 BUG-08: Stock never goes down, so we sell items we don't have

**Difficulty:** Medium  **Area:** Orders / inventory

**Reported by:** Warehouse team 📦

> "We had only 2 USB-C chargers, but we received **5 orders** for them. The website still says
> 2 are in stock!"

**Steps to reproduce**
```bash
# The USB-C Charger (id 7) has only 2 in stock.

# 1. Rahul buys both chargers
curl -X POST http://localhost:3000/api/cart/items \
  -H "Authorization: Bearer rahul-token-222" -H "Content-Type: application/json" \
  -d '{"productId": 7, "quantity": 2}'
curl -X POST http://localhost:3000/api/orders -H "Authorization: Bearer rahul-token-222"

# 2. Priya tries to buy 2 chargers as well
curl -X POST http://localhost:3000/api/cart/items \
  -H "Authorization: Bearer priya-token-333" -H "Content-Type: application/json" \
  -d '{"productId": 7, "quantity": 2}'
curl -X POST http://localhost:3000/api/orders -H "Authorization: Bearer priya-token-333"
```

**Expected:** Step 2 fails with `400 Only 0 unit(s) of USB-C Charger available`. After Rahul's
order, the charger stock is `0`.

**Actual:** Priya adds the chargers to her cart **and** places the order successfully. Stock is
still `2`, so you can repeat this forever.

<details>
<summary>💡 Hint</summary>

Look at how `product` is created in **Step 2** of `placeOrder`. Is
`product.stock -= item.quantity` changing the object stored in `db.products`, or something else?
</details>

---

## 🔴 BUG-09: Placed orders have no items

**Difficulty:** Hard  **Area:** Orders / cart

**Reported by:** Delivery partner 🛵

> "We got an order worth ₹1,617, but the order slip has **zero items**. What are we
> supposed to deliver?"

**Steps to reproduce**
```bash
# Rahul's cart already has 2 T-shirts. Place the order:
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer rahul-token-222" -H "Content-Type: application/json" \
  -d '{"couponCode": "WELCOME10"}'
```

**Expected:** The order response lists the purchased items, and the cart is empty afterwards.

**Actual:**
```json
{
  "success": true,
  "data": { "id": 2, "items": [], "subtotal": 998, "discount": 100, "total": 947, ... }
}
```
The `subtotal` and `total` are correct, so the items **were** there while the price was being
calculated. They disappear afterwards. Cancelling this order also doesn't put any stock back.

> ⚠️ Fixing this bug **correctly** matters. A wrong fix can also change what the
> customer's cart contains.

<details>
<summary>💡 Hint 1</summary>

Add `console.log(order.items)` just **before** and just **after** `cartService.clearCart(userId)`.
</details>

<details>
<summary>💡 Hint 2</summary>

In JavaScript, arrays and objects are assigned **by reference**. How many arrays exist in
memory here: one or two? Also look at **how** `clearCart` empties the cart.
</details>

---

## 🔴 BUG-10: Product listing order changes randomly

**Difficulty:** Hard  **Area:** Products

**Reported by:** Marketing team

> "The homepage is supposed to show products in the default order (newest catalogue order, by id).
> But sometimes it shows the cheapest products first, sometimes the highest-rated first.
> After we restart the server it's fine again... until it isn't."

**Steps to reproduce**
```bash
# 1. default listing. Note down the product ids you get
curl "http://localhost:3000/api/products?limit=6"

# 2. some customer sorts by price
curl "http://localhost:3000/api/products?sort=price_asc"

# 3. the exact same request as step 1
curl "http://localhost:3000/api/products?limit=6"
```

**Expected:** Step 3 returns **exactly the same products in the same order** as step 1.
The same request should always give the same result.

**Actual:** Step 3 returns different products, now ordered by price, even though no `sort` was
requested. Strangely, if you sort **inside a category** (`?category=home&sort=price_asc`), the
bug does **not** happen. Why?

<details>
<summary>💡 Hint</summary>

Some array methods return a **new** array (`filter`, `map`, `slice`) and some change the
**original** array (`sort`, `push`, `splice`, `reverse`). What is `result` pointing to when there
is no category or search filter?
</details>

---

## ✅ Done?

After fixing everything, run this full flow on a fresh server and check that everything makes sense:

1. Rahul changes his T-shirt quantity to 1 (`PATCH /api/cart/items/3`), then adds the USB-C Charger
   (id 7, qty 2) → cart `total` is a number
2. Rahul validates `DIWALI50` → rejected (expired). `WELCOME10` → accepted
3. Rahul places an order with `WELCOME10` → items are present, totals are correct
4. Charger stock is now `0`. Rahul's cart is empty
5. `GET /api/orders` shows Rahul's order. `GET /api/orders/:id` works for Rahul and admin, and returns 403 for Priya
6. Rahul cancels the order → charger stock goes back to `2`
7. `GET /api/products?sort=price_asc` followed by `GET /api/products` → default order is unchanged

🎉 Congrats, you just debugged a real-world style backend!
