import { sql } from '../src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function addExtrasAndPortions() {
  try {
    console.log('Adding extras and portions support to database...\n');

    // Add columns to menu_items table
    console.log('Adding extras and portions columns to menu_items...');

    // Check if columns already exist
    const checkColumns = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'menu_items'
      AND column_name IN ('extras', 'portions', 'original_price')
    `;

    const existingColumns = checkColumns.map(col => col.column_name);

    // Add original_price column if it doesn't exist
    if (!existingColumns.includes('original_price')) {
      await sql`
        ALTER TABLE menu_items
        ADD COLUMN original_price DECIMAL(10, 2)
      `;
      console.log('✓ Added original_price column');
    }

    // Add extras column if it doesn't exist (stores JSON array of extras)
    if (!existingColumns.includes('extras')) {
      await sql`
        ALTER TABLE menu_items
        ADD COLUMN extras JSONB DEFAULT '[]'::jsonb
      `;
      console.log('✓ Added extras column');
    }

    // Add portions column if it doesn't exist (stores JSON array of portions)
    if (!existingColumns.includes('portions')) {
      await sql`
        ALTER TABLE menu_items
        ADD COLUMN portions JSONB DEFAULT '[]'::jsonb
      `;
      console.log('✓ Added portions column');
    }

    console.log('\n✓ Database updated successfully!');
    console.log('\nExtras format: [{ "id": 1, "name": "egg", "price": 2.50, "originalPrice": 5.00 }]');
    console.log('Portions format: [{ "id": "individual", "name": "Individual", "price": 0 }]');

  } catch (error) {
    console.error('Error updating database:', error);
    throw error;
  }
}

addExtrasAndPortions()
  .then(() => {
    console.log('\nDatabase update completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database update failed:', error);
    process.exit(1);
  });
