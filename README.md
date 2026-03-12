# Gastroverse – Restaurant Management Platform

A full-stack MERN restaurant management platform enabling customers to browse menus, reserve tables, and place orders with dual user roles (Customer & Restaurant Owner).

## Tech Stack

- **Frontend:** React.js (Vite), React Router, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Auth:** JWT with Role-Based Access Control (RBAC)
- **Containerization:** Docker & Docker Compose
- **Deployment:** Google Cloud Platform

## Features

- **Customer Role:** Browse restaurants, view menus, reserve tables, place orders, track order status
- **Owner Role:** Manage restaurants, menus, reservations, orders, and view business analytics
- **Auth:** JWT-based authentication with role-based route protection
- **Dashboard:** Owner analytics with order/revenue insights

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (or Docker)
- Docker & Docker Compose (optional)

### Local Development

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# Start server (from server/)
npm run dev

# Start client (from client/)
npm run dev
```

### Docker

```bash
docker-compose up --build
```

The client runs on `http://localhost:5173` and the API on `http://localhost:5000`.

## Project Structure

```
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route pages
│   │   ├── context/       # React context (Auth)
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API service layer
│   │   └── utils/         # Helpers & constants
│   └── ...
├── server/                # Express backend
│   ├── config/            # DB connection
│   ├── controllers/       # Route handlers
│   ├── middleware/         # Auth & RBAC middleware
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   └── utils/             # Helpers
├── docker-compose.yml
├── Dockerfile.client
└── Dockerfile.server
```

## API Endpoints

| Method | Endpoint                    | Access       |
|--------|-----------------------------|-------------|
| POST   | /api/auth/register          | Public      |
| POST   | /api/auth/login             | Public      |
| GET    | /api/auth/me                | Authenticated |
| GET    | /api/restaurants            | Public      |
| POST   | /api/restaurants            | Owner       |
| GET    | /api/menu/:restaurantId     | Public      |
| POST   | /api/menu                   | Owner       |
| POST   | /api/orders                 | Customer    |
| GET    | /api/orders/my              | Customer    |
| GET    | /api/orders/restaurant/:id  | Owner       |
| PATCH  | /api/orders/:id/status      | Owner       |
| POST   | /api/reservations           | Customer    |
| GET    | /api/reservations/my        | Customer    |
| GET    | /api/reservations/restaurant/:id | Owner  |
| PATCH  | /api/reservations/:id/status| Owner       |

## License

MIT
