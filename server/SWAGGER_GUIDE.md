# Gastroverse API — Swagger Documentation Guide

## Quick Start

1. **Start the server**
   ```bash
   cd server
   npm run dev
   ```
2. **Open Swagger UI** in your browser:
   ```
   http://localhost:5000/api-docs
   ```

---

## How to Use Swagger UI

### Step 1 — Register a User

1. Expand **Auth** → `POST /auth/register`
2. Click **Try it out**
3. Fill in the request body:
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "securePass123",
     "role": "customer",
     "phone": "+1234567890"
   }
   ```
   > Use `"role": "owner"` if you want to manage restaurants.
4. Click **Execute**
5. **Copy the `token`** from the response — you'll need it next.

### Step 2 — Authorize (Add Your JWT Token)

1. Click the **🔓 Authorize** button (top-right of the page)
2. In the **Value** field, paste your token:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   > Do NOT add "Bearer " prefix — Swagger adds it automatically.
3. Click **Authorize**, then **Close**
4. All protected endpoints will now use your token.

### Step 3 — Test Any Endpoint

1. Expand the endpoint you want to test
2. Click **Try it out**
3. Fill in path parameters (IDs) and request body as needed
4. Click **Execute**
5. See the response below with status code, headers, and body

---

## API Endpoints Reference

### 🔐 Auth (Public + Protected)

| Method | Endpoint         | Auth Required | Role     | Description                    |
|--------|------------------|---------------|----------|--------------------------------|
| POST   | `/auth/register` | No            | —        | Register a new user            |
| POST   | `/auth/login`    | No            | —        | Login and get JWT token        |
| GET    | `/auth/me`       | Yes           | Any      | Get current user profile       |

### 🍽️ Restaurants

| Method | Endpoint            | Auth Required | Role  | Description                          |
|--------|---------------------|---------------|-------|--------------------------------------|
| GET    | `/restaurants`      | No            | —     | List all open restaurants            |
| GET    | `/restaurants/my`   | Yes           | Owner | List your own restaurants            |
| GET    | `/restaurants/{id}` | No            | —     | Get restaurant details by ID         |
| POST   | `/restaurants`      | Yes           | Owner | Create a new restaurant              |
| PUT    | `/restaurants/{id}` | Yes           | Owner | Update your restaurant               |
| DELETE | `/restaurants/{id}` | Yes           | Owner | Delete your restaurant               |

### 📋 Menu

| Method | Endpoint                  | Auth Required | Role  | Description                           |
|--------|---------------------------|---------------|-------|---------------------------------------|
| GET    | `/menu/{restaurantId}`    | No            | —     | Get all available items for a restaurant |
| POST   | `/menu`                   | Yes           | Owner | Add a menu item to your restaurant    |
| PUT    | `/menu/{id}`              | Yes           | Owner | Update a menu item                    |
| DELETE | `/menu/{id}`              | Yes           | Owner | Delete a menu item                    |

### 🛒 Orders

| Method | Endpoint                              | Auth Required | Role     | Description                         |
|--------|---------------------------------------|---------------|----------|-------------------------------------|
| POST   | `/orders`                             | Yes           | Customer | Place a new order                   |
| GET    | `/orders/my`                          | Yes           | Customer | View your orders                    |
| GET    | `/orders/restaurant/{restaurantId}`   | Yes           | Owner    | View orders for your restaurant     |
| PATCH  | `/orders/{id}/status`                 | Yes           | Owner    | Update order status                 |

**Order Status Flow:**
```
pending → confirmed → preparing → ready → delivered
   ↓          ↓
cancelled  cancelled
```

### 📅 Reservations

| Method | Endpoint                                    | Auth Required | Role     | Description                              |
|--------|---------------------------------------------|---------------|----------|------------------------------------------|
| POST   | `/reservations`                             | Yes           | Customer | Make a reservation                       |
| GET    | `/reservations/my`                          | Yes           | Customer | View your reservations                   |
| GET    | `/reservations/restaurant/{restaurantId}`   | Yes           | Owner    | View reservations for your restaurant    |
| PATCH  | `/reservations/{id}/status`                 | Yes           | Owner    | Update reservation status                |

**Valid reservation statuses:** `pending`, `confirmed`, `cancelled`, `completed`

---

## Common Workflows

### As a Customer

1. **Register** with `role: "customer"` → copy token → **Authorize**
2. **Browse restaurants** — `GET /restaurants`
3. **View a menu** — `GET /menu/{restaurantId}`
4. **Place an order:**
   ```json
   {
     "restaurant": "<restaurant_id>",
     "items": [
       { "menuItem": "<menu_item_id>", "quantity": 2 },
       { "menuItem": "<another_item_id>", "quantity": 1 }
     ],
     "notes": "No onions please"
   }
   ```
   > The total amount is calculated server-side from actual menu prices.
5. **Make a reservation:**
   ```json
   {
     "restaurant": "<restaurant_id>",
     "date": "2026-04-15",
     "time": "19:00",
     "partySize": 4,
     "notes": "Window seat preferred"
   }
   ```
6. **Check your orders** — `GET /orders/my`
7. **Check your reservations** — `GET /reservations/my`

### As an Owner

1. **Register** with `role: "owner"` → copy token → **Authorize**
2. **Create a restaurant:**
   ```json
   {
     "name": "The Great Kitchen",
     "description": "A fine-dining experience",
     "cuisine": ["Italian", "French"],
     "address": {
       "street": "123 Main St",
       "city": "New York",
       "state": "NY",
       "zipCode": "10001"
     },
     "phone": "+1234567890",
     "isOpen": true
   }
   ```
3. **Add menu items** — `POST /menu` (include the `restaurant` ID)
4. **View incoming orders** — `GET /orders/restaurant/{restaurantId}`
5. **Update order status** — `PATCH /orders/{id}/status` with `{ "status": "confirmed" }`
6. **View reservations** — `GET /reservations/restaurant/{restaurantId}`
7. **Manage reservations** — `PATCH /reservations/{id}/status`

---

## Useful Links

| URL                                     | Description              |
|-----------------------------------------|--------------------------|
| `http://localhost:5000/api-docs`        | Swagger UI (interactive) |
| `http://localhost:5000/api-docs.json`   | Raw OpenAPI JSON spec    |
| `http://localhost:5000/api/health`      | Server health check      |

---

## Troubleshooting

| Problem                          | Solution                                                                 |
|----------------------------------|--------------------------------------------------------------------------|
| **401 Unauthorized**             | Click **Authorize** and paste a valid JWT token                         |
| **403 Forbidden**                | You need the correct role (owner vs customer) for that endpoint          |
| **400 Bad Request**              | Check the request body — required fields may be missing or invalid       |
| **Token expired**                | Login again via `POST /auth/login` and re-authorize with the new token   |
| **Swagger page not loading**     | Make sure the server is running (`npm run dev`)                          |
| **CORS errors in browser**       | Swagger UI is served by the backend, so CORS shouldn't apply. Clear cache if issues persist |

---

## Notes

- Tokens expire after **7 days** by default.
- Request body size is limited to **10 KB**.
- Auth endpoints (`/auth/register`, `/auth/login`) have stricter rate limiting.
- All IDs are MongoDB ObjectIDs (24-character hex strings like `665a1b2c3d4e5f6a7b8c9d0e`).
- Party size for reservations must be between **1 and 20**.
- Item quantity per order line must be between **1 and 20**.
- Reservation dates must be in the **future**.
