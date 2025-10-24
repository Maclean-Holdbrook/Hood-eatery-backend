# Hood Eatery Backend

Backend API server for Hood Eatery restaurant website with real-time order tracking.

## Tech Stack

- Node.js & Express.js
- Neon PostgreSQL (Serverless Database)
- Socket.io (Real-time WebSocket)
- JWT Authentication
- Bcrypt.js (Password hashing)
- Multer (File uploads)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Neon Database

Follow the detailed guide in **[NEON_SETUP_GUIDE.md](./NEON_SETUP_GUIDE.md)** to:
- Create a Neon account
- Create a new project
- Get your database connection string

### 3. Configure Environment

Create `.env` file:
```bash
cp .env.example .env
```

Update with your Neon credentials:
```env
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
JWT_SECRET=your_random_secret_key
ADMIN_EMAIL=admin@hoodeatery.com
ADMIN_PASSWORD=admin123
```

### 4. Initialize Database

```bash
npm run init-db
```

### 5. Start Server

```bash
npm run dev  # Development
npm start    # Production
```

## Database Tables

- **users** - User accounts with authentication
- **menu_categories** - Menu organization
- **menu_items** - Restaurant menu with images
- **orders** - Customer orders with tracking
- **order_items** - Order line items

## API Endpoints

### Auth
- POST `/api/auth/register` - Register
- POST `/api/auth/login` - Login
- GET `/api/auth/me` - Current user

### Menu
- GET `/api/menu/categories` - All categories
- GET `/api/menu/items` - All items
- POST `/api/menu/items` - Create item (admin)
- PUT `/api/menu/items/:id` - Update item (admin)

### Orders
- POST `/api/orders` - Create order
- GET `/api/orders/my-orders` - User orders
- PUT `/api/orders/:id/status` - Update status (admin)

## Real-time WebSocket

```javascript
socket.emit('trackOrder', orderNumber);
socket.on('orderUpdate', (data) => {
  // Handle update
});
```

## Documentation

- **[NEON_SETUP_GUIDE.md](./NEON_SETUP_GUIDE.md)** - Complete database setup guide
- **[API Documentation](./API_DOCS.md)** - Full API reference (if needed)

## Scripts

```bash
npm start       # Start server
npm run dev     # Dev with hot-reload
npm run init-db # Initialize database
```

## Security

- JWT authentication
- Bcrypt password hashing
- Role-based access control
- Parameterized SQL queries

## File Uploads

Images stored in `uploads/menu/` directory, accessible at `/uploads/menu/[filename]`
