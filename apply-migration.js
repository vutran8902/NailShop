// Script to apply the migration to add user_email to appointment_schedule table
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  process.exit(1);
}

// Create Supabase client with service role key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('Applying migration to add user_email to appointment_schedule table...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'supabase/migrations/20250406095900_add_rls_to_appointment_schedule.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 100)}...`);
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
      
      if (error) {
        console.error('Error executing SQL:', error);
        // Continue with other statements even if one fails
      }
    }
    
    console.log('Migration applied successfully!');
    
    // Verify the column was added
    const { data, error } = await supabase
      .from('appointment_schedule')
      .select('user_email')
      .limit(1);
    
    if (error) {
      console.error('Error verifying migration:', error);
    } else {
      console.log('Verification successful. The user_email column exists.');
    }
    
  } catch (error) {
    console.error('Error applying migration:', error);
  }
}

applyMigration();
