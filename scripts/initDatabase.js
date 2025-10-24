import { sql } from '../src/config/database.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function initializeDatabase() {
  try {
    console.log('Initializing database schema...\n');

    // Create users table
    console.log('Creating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        google_id VARCHAR(255) UNIQUE,
        role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create menu_categories table
    console.log('Creating menu_categories table...');
    await sql`
      CREATE TABLE IF NOT EXISTS menu_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        description TEXT,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create menu_items table
    console.log('Creating menu_items table...');
    await sql`
      CREATE TABLE IF NOT EXISTS menu_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image_url TEXT,
        is_available BOOLEAN DEFAULT TRUE,
        is_featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create orders table
    console.log('Creating orders table...');
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        order_number VARCHAR(50) UNIQUE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        customer_phone VARCHAR(20) NOT NULL,
        delivery_address TEXT NOT NULL,
        delivery_lat DECIMAL(10, 8),
        delivery_lng DECIMAL(11, 8),
        subtotal DECIMAL(10, 2) NOT NULL,
        delivery_fee DECIMAL(10, 2) DEFAULT 0,
        total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
        payment_method VARCHAR(50) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'mobile_money')),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create order_items table
    console.log('Creating order_items table...');
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        menu_item_id UUID REFERENCES menu_items(id),
        menu_item_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL
      )
    `;

    // Create indexes
    console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;

    console.log('\n✓ Database schema created successfully!\n');

    // Check if admin user exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@hoodeatery.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmins = await sql`
      SELECT email FROM users WHERE email = ${adminEmail}
    `;

    if (existingAdmins.length === 0) {
      console.log('Creating admin user...');

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      // Create admin user
      await sql`
        INSERT INTO users (email, password, full_name, role)
        VALUES (${adminEmail}, ${hashedPassword}, 'Admin User', 'admin')
      `;

      console.log('✓ Admin user created successfully!');
      console.log(`  Email: ${adminEmail}`);
      console.log(`  Password: ${adminPassword}\n`);
    } else {
      console.log('✓ Admin user already exists.\n');
    }

    // Create some default categories
    const existingCategories = await sql`
      SELECT * FROM menu_categories
    `;

    if (existingCategories.length === 0) {
      console.log('Creating default menu categories...');

      await sql`
        INSERT INTO menu_categories (name, description, display_order)
        VALUES
          ('Appetizers', 'Start your meal with our delicious appetizers', 1),
          ('Main Course', 'Hearty and satisfying main dishes', 2),
          ('Desserts', 'Sweet treats to end your meal', 3),
          ('Beverages', 'Refreshing drinks and beverages', 4)
      `;

      console.log('✓ Default categories created successfully!\n');
    } else {
      console.log('✓ Menu categories already exist.\n');
    }

    console.log('==========================================');
    console.log('Database initialization complete!');
    console.log('==========================================\n');
    console.log('Next steps:');
    console.log('  1. Start the server: npm run dev');
    console.log('  2. Login with admin credentials to add menu items\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error initializing database:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

initializeDatabase();
