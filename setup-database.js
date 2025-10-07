#!/usr/bin/env node

/**
 * Database Setup Script
 * This script sets up the Supabase database tables and policies
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseServiceKey);
  console.error('\nPlease check your .env.local file and ensure these variables are set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 [Database Setup] Starting database setup...');
  
  try {
    // Read the schema file
    const schemaPath = path.join(process.cwd(), 'supabase-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📄 [Database Setup] Read schema file:', schemaPath);
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📋 [Database Setup] Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.trim()) {
        console.log(`⚡ [Database Setup] Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            // Some errors are expected (like "already exists")
            if (error.message.includes('already exists') || 
                error.message.includes('does not exist') ||
                error.message.includes('relation') && error.message.includes('already exists')) {
              console.log(`⚠️  [Database Setup] Statement ${i + 1} skipped (already exists): ${error.message}`);
            } else {
              console.error(`❌ [Database Setup] Statement ${i + 1} failed:`, error.message);
              console.error(`📝 [Database Setup] Statement:`, statement.substring(0, 100) + '...');
            }
          } else {
            console.log(`✅ [Database Setup] Statement ${i + 1} executed successfully`);
          }
        } catch (execError) {
          console.error(`❌ [Database Setup] Statement ${i + 1} execution error:`, execError.message);
        }
      }
    }
    
    // Verify tables were created
    console.log('\n🔍 [Database Setup] Verifying table creation...');
    
    const tables = ['users', 'generations', 'media_files'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.error(`❌ [Database Setup] Table '${table}' verification failed:`, error.message);
        } else {
          console.log(`✅ [Database Setup] Table '${table}' exists and is accessible`);
        }
      } catch (verifyError) {
        console.error(`❌ [Database Setup] Table '${table}' verification error:`, verifyError.message);
      }
    }
    
    console.log('\n🎉 [Database Setup] Database setup completed!');
    console.log('📋 [Database Setup] Next steps:');
    console.log('   1. Test the API endpoints');
    console.log('   2. Verify authentication is working');
    console.log('   3. Test generation saving to database');
    
  } catch (error) {
    console.error('❌ [Database Setup] Setup failed:', error);
    process.exit(1);
  }
}

// Alternative method using direct SQL execution
async function setupDatabaseDirect() {
  console.log('🚀 [Database Setup] Starting direct database setup...');
  
  try {
    // Read the schema file
    const schemaPath = path.join(process.cwd(), 'supabase-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📄 [Database Setup] Read schema file:', schemaPath);
    
    // Execute the entire schema at once
    const { error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      console.error('❌ [Database Setup] Schema execution failed:', error);
      
      // Try to provide helpful error messages
      if (error.message.includes('permission denied')) {
        console.error('💡 [Database Setup] Permission denied. Make sure you\'re using the service role key.');
      } else if (error.message.includes('relation') && error.message.includes('already exists')) {
        console.log('⚠️  [Database Setup] Some tables already exist. This is normal if you\'ve run this before.');
      }
    } else {
      console.log('✅ [Database Setup] Schema executed successfully');
    }
    
    // Verify tables
    console.log('\n🔍 [Database Setup] Verifying table creation...');
    
    const tables = ['users', 'generations', 'media_files'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.error(`❌ [Database Setup] Table '${table}' verification failed:`, error.message);
        } else {
          console.log(`✅ [Database Setup] Table '${table}' exists and is accessible`);
        }
      } catch (verifyError) {
        console.error(`❌ [Database Setup] Table '${table}' verification error:`, verifyError.message);
      }
    }
    
    console.log('\n🎉 [Database Setup] Database setup completed!');
    
  } catch (error) {
    console.error('❌ [Database Setup] Setup failed:', error);
    process.exit(1);
  }
}

// Test database connection
async function testConnection() {
  console.log('🔌 [Database Setup] Testing database connection...');
  
  try {
    const { data, error } = await supabase
      .from('generations')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ [Database Setup] Connection test failed:', error.message);
      return false;
    } else {
      console.log('✅ [Database Setup] Database connection successful');
      return true;
    }
  } catch (error) {
    console.error('❌ [Database Setup] Connection test error:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🎯 [Database Setup] Supabase Database Setup Script');
  console.log('================================================');
  
  // Test connection first
  const isConnected = await testConnection();
  
  if (!isConnected) {
    console.log('\n🔄 [Database Setup] Connection failed, attempting to create tables...');
    await setupDatabaseDirect();
  } else {
    console.log('\n✅ [Database Setup] Database is already accessible');
    console.log('💡 [Database Setup] If you\'re still getting table errors, try running the setup again');
  }
}

// Run the setup
main().catch(console.error);
