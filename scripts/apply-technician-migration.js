// Script to apply the technician migration directly using the Supabase client
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables from .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or key. Make sure .env.local is properly configured.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('Checking if user_email column exists in salon_technicians table...');
    
    // First check if the column exists
    const { data: columnExists, error: columnCheckError } = await supabase.rpc(
      'exec_sql',
      { 
        sql: `
          SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'salon_technicians'
            AND column_name = 'user_email'
          ) as exists;
        `
      }
    );
    
    if (columnCheckError) {
      console.error('Error checking column existence:', columnCheckError);
      
      // Alternative approach: try to add the column directly and catch any errors
      console.log('Attempting to add user_email column directly...');
      
      // Add user_email column
      const { error: addColumnError } = await supabase.rpc(
        'exec_sql',
        { 
          sql: `
            ALTER TABLE salon_technicians 
            ADD COLUMN IF NOT EXISTS user_email TEXT;
          `
        }
      );
      
      if (addColumnError) {
        console.error('Error adding user_email column:', addColumnError);
      } else {
        console.log('Successfully added user_email column');
      }
      
      // Update existing records
      const { error: updateError } = await supabase.rpc(
        'exec_sql',
        { 
          sql: `
            UPDATE salon_technicians 
            SET user_email = email 
            WHERE user_email IS NULL;
          `
        }
      );
      
      if (updateError) {
        console.error('Error updating existing records:', updateError);
      } else {
        console.log('Successfully updated existing records');
      }
    } else {
      console.log('Column check result:', columnExists);
      if (columnExists && columnExists[0] && columnExists[0].exists) {
        console.log('user_email column already exists');
      } else {
        console.log('user_email column does not exist, adding it...');
        
        // Add user_email column
        const { error: addColumnError } = await supabase.rpc(
          'exec_sql',
          { 
            sql: `
              ALTER TABLE salon_technicians 
              ADD COLUMN user_email TEXT;
            `
          }
        );
        
        if (addColumnError) {
          console.error('Error adding user_email column:', addColumnError);
        } else {
          console.log('Successfully added user_email column');
        }
        
        // Update existing records
        const { error: updateError } = await supabase.rpc(
          'exec_sql',
          { 
            sql: `
              UPDATE salon_technicians 
              SET user_email = email 
              WHERE user_email IS NULL;
            `
          }
        );
        
        if (updateError) {
          console.error('Error updating existing records:', updateError);
        } else {
          console.log('Successfully updated existing records');
        }
      }
    }
    
    // Create index
    console.log('Creating index on user_email column...');
    const { error: indexError } = await supabase.rpc(
      'exec_sql',
      { 
        sql: `
          CREATE INDEX IF NOT EXISTS idx_salon_technicians_user_email 
          ON salon_technicians(user_email);
        `
      }
    );
    
    if (indexError) {
      console.error('Error creating index:', indexError);
    } else {
      console.log('Successfully created index');
    }
    
    // Recreate policies
    console.log('Recreating RLS policies...');
    
    // Drop existing policies
    const policies = [
      "Users can view their own technicians",
      "Users can insert their own technicians",
      "Users can update their own technicians",
      "Users can delete their own technicians"
    ];
    
    for (const policy of policies) {
      const { error: dropError } = await supabase.rpc(
        'exec_sql',
        { 
          sql: `
            DROP POLICY IF EXISTS "${policy}" ON salon_technicians;
          `
        }
      );
      
      if (dropError) {
        console.error(`Error dropping policy "${policy}":`, dropError);
      }
    }
    
    // Create policies
    const policyStatements = [
      `CREATE POLICY "Users can view their own technicians" ON salon_technicians FOR SELECT USING (user_email = auth.email());`,
      `CREATE POLICY "Users can insert their own technicians" ON salon_technicians FOR INSERT WITH CHECK (user_email = auth.email());`,
      `CREATE POLICY "Users can update their own technicians" ON salon_technicians FOR UPDATE USING (user_email = auth.email());`,
      `CREATE POLICY "Users can delete their own technicians" ON salon_technicians FOR DELETE USING (user_email = auth.email());`
    ];
    
    for (const statement of policyStatements) {
      const { error: createError } = await supabase.rpc(
        'exec_sql',
        { sql: statement }
      );
      
      if (createError) {
        console.error(`Error creating policy:`, createError);
      }
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Error applying migration:', error);
  }
}

// Run the function
applyMigration();
