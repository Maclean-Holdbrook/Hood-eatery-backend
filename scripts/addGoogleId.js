import { sql } from '../src/config/database.js';

async function addGoogleIdColumn() {
  try {
    console.log('Adding google_id column to users table...');

    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE
    `;

    console.log('✓ google_id column added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding google_id column:', error.message);
    process.exit(1);
  }
}

addGoogleIdColumn();
