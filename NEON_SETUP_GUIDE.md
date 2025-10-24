# Neon Database Setup Guide

This guide will walk you through setting up your Hood Eatery backend with Neon database.

## What is Neon?

Neon is a serverless PostgreSQL database that offers:
- Automatic scaling
- Instant branching
- Generous free tier
- No connection pooling issues
- Built-in connection pooling

## Step 1: Create a Neon Account

1. Go to [https://console.neon.tech](https://console.neon.tech)
2. Click "Sign Up" in the top right corner
3. Sign up using:
   - GitHub account (recommended for faster setup)
   - Google account
   - Email and password

## Step 2: Create a New Project

1. After logging in, you'll see the Neon dashboard
2. Click "New Project" button
3. Configure your project:
   - **Project Name**: `hood-eatery` (or any name you prefer)
   - **Region**: Choose the region closest to your users (e.g., US East, Europe, Asia Pacific)
   - **PostgreSQL Version**: Leave default (latest version)
4. Click "Create Project"

## Step 3: Get Your Database Connection String

After creating the project, you'll be redirected to the project dashboard.

### Finding Your Connection String:

1. Look for the "Connection Details" section on the dashboard
2. You'll see a connection string that looks like this:
   ```
   postgresql://username:password@ep-xxx-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```
3. Click the "Copy" button next to the connection string

### Connection String Format:

```
postgresql://[username]:[password]@[host]/[database]?sslmode=require
```

**Components:**
- `username`: Your database username (usually matches your project name)
- `password`: Auto-generated password
- `host`: Your Neon database host (format: `ep-xxx-xxx-xxx.region.aws.neon.tech`)
- `database`: Your database name (default is usually `neondb`)

## Step 4: Configure Your Backend

1. Navigate to your Hood Eatery Backend directory:
   ```bash
   cd "Hood Eatery Backend"
   ```

2. Create a `.env` file by copying the example:
   ```bash
   cp .env.example .env
   ```

3. Open the `.env` file in your text editor

4. Replace the DATABASE_URL with your Neon connection string:
   ```env
   # Neon Database Configuration
   DATABASE_URL=postgresql://your_username:your_password@ep-xxx-xxx-xxx.region.aws.neon.tech/your_dbname?sslmode=require
   ```

5. Update other environment variables as needed:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Neon Database Configuration
   DATABASE_URL=your_neon_connection_string_here

   # JWT Secret
   JWT_SECRET=your_random_secret_key_here
   JWT_EXPIRE=7d

   # Admin Credentials (for initial setup)
   ADMIN_EMAIL=admin@hoodeatery.com
   ADMIN_PASSWORD=admin123

   # CORS
   FRONTEND_URL=http://localhost:5173
   ```

## Step 5: Initialize Your Database

Run the database initialization script to create all tables and seed initial data:

```bash
npm run init-db
```

This script will:
- Create all necessary tables (users, menu_categories, menu_items, orders, order_items)
- Create indexes for better performance
- Create an admin user with credentials from your .env file
- Create default menu categories

## Step 6: Start Your Server

Start the development server:

```bash
npm run dev
```

You should see:
```
Server running on port 5000
Environment: development
```

## Step 7: Test Your Setup

Test the API by visiting:
- Health check: `http://localhost:5000/api/health`

Expected response:
```json
{
  "success": true,
  "message": "Hood Eatery API is running"
}
```

## Database Schema

Your database includes the following tables:

### users
- id (UUID, Primary Key)
- email (VARCHAR, Unique)
- password (VARCHAR, Hashed)
- full_name (VARCHAR)
- phone (VARCHAR)
- role (VARCHAR: 'customer' or 'admin')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### menu_categories
- id (UUID, Primary Key)
- name (VARCHAR)
- description (TEXT)
- display_order (INT)
- created_at (TIMESTAMP)

### menu_items
- id (UUID, Primary Key)
- category_id (UUID, Foreign Key)
- name (VARCHAR)
- description (TEXT)
- price (DECIMAL)
- image_url (TEXT)
- is_available (BOOLEAN)
- is_featured (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### orders
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- order_number (VARCHAR, Unique)
- customer_name (VARCHAR)
- customer_email (VARCHAR)
- customer_phone (VARCHAR)
- delivery_address (TEXT)
- delivery_lat (DECIMAL)
- delivery_lng (DECIMAL)
- subtotal (DECIMAL)
- delivery_fee (DECIMAL)
- total (DECIMAL)
- status (VARCHAR)
- payment_method (VARCHAR)
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### order_items
- id (UUID, Primary Key)
- order_id (UUID, Foreign Key)
- menu_item_id (UUID, Foreign Key)
- menu_item_name (VARCHAR)
- quantity (INT)
- price (DECIMAL)
- subtotal (DECIMAL)

## Managing Your Neon Database

### Accessing the Neon Console

1. Go to [https://console.neon.tech](https://console.neon.tech)
2. Click on your `hood-eatery` project
3. You can:
   - View connection details
   - Monitor database usage
   - Create branches for testing
   - View logs and metrics

### Using SQL Editor

Neon provides a built-in SQL editor:

1. In your project dashboard, click "SQL Editor" in the left sidebar
2. You can run any SQL queries directly:
   ```sql
   -- View all users
   SELECT * FROM users;

   -- View all menu items
   SELECT * FROM menu_items;

   -- View all orders
   SELECT * FROM orders ORDER BY created_at DESC;
   ```

### Creating Database Branches

Neon allows you to create branches (copies) of your database for testing:

1. In your project dashboard, click "Branches" in the left sidebar
2. Click "New Branch"
3. Select the parent branch (usually `main`)
4. Give it a name (e.g., `development`, `testing`)
5. Click "Create Branch"

You'll get a new connection string for the branch that you can use for testing without affecting production data.

## Troubleshooting

### Connection Error: "password authentication failed"
- Verify your DATABASE_URL is correct
- Make sure you copied the full connection string including the password
- Check if you need to regenerate your password in Neon console

### Connection Error: "getaddrinfo ENOTFOUND"
- Check your internet connection
- Verify the host URL is correct
- Make sure SSL mode is set to 'require'

### "permission denied to create table"
- Make sure you're using the correct database user
- Verify your user has sufficient privileges

### Tables Not Created
- Run `npm run init-db` to initialize the database
- Check the console for error messages
- Verify your DATABASE_URL is correctly set

## Security Best Practices

1. **Never commit `.env` file**: The `.env` file is already in `.gitignore`
2. **Use strong passwords**: Change the default admin password after first login
3. **Rotate JWT secrets**: Use a strong, random JWT secret in production
4. **Use environment variables**: Never hardcode sensitive data in your code
5. **Enable connection pooling**: Neon automatically handles this
6. **Monitor usage**: Keep an eye on your Neon dashboard for unusual activity

## Neon Free Tier Limits

The Neon free tier includes:
- 10 GB storage
- 100 hours of compute per month
- Unlimited branches
- Automatic scaling

For production use with high traffic, consider upgrading to a paid plan.

## Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [Neon Serverless Driver Docs](https://neon.tech/docs/serverless/serverless-driver)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Next Steps

After setup is complete:
1. Login to the admin panel using your admin credentials
2. Add menu categories and items
3. Test the ordering flow
4. Configure the frontend to connect to your backend

Need help? Check the README.md for more information about the API endpoints and features.
