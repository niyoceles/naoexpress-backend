# RelayXpress Backend

RelayXpress is a production-grade logistics and courier platform with built-in warehousing and cross-border capabilities.

## Features
- **JWT Auth & RBAC**: Secure user, merchant, and admin access.
- **Shipment Engine**: Tracking number generation and status lifecycle management.
- **WMS Integration**: Inventory and warehouse modeling support.
- **Public Tracking**: Real-time visibility for all customers without login.
- **Quote Engine**: Rule-based shipping cost calculation.

## Tech Stack
- **Node.js + Express.js**
- **TypeScript**
- **MongoDB + Mongoose**
- **Docker + Docker Compose**

## Setup
1. `npm install`
2. `docker-compose up -d` (to start MongoDB)
3. `npm run dev` (to start server)

## API Documentation (Summary)
- `POST /api/auth/register`: User registration
- `POST /api/auth/login`: Issue JWT token
- `GET /api/track/:trackingNumber`: Tracking lookup
- `POST /api/shipments`: Create shipment (Auth required)

## Seeding
To populate the DB with sample data:
`npx ts-node src/utils/seed.ts`
# naoexpress-backend
