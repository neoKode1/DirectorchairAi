#!/usr/bin/env node

/**
 * Database Test Script
 * This script tests if the database tables are properly set up
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseKey);
  console.error('\nPlease check your .env.local file and ensure these variables are set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseSetup() {
  console.log('🧪 [Database Test] Testing database setup...');
  console.log('==========================================');
  
  const tests = [
    {
      name: 'Users Table',
      test: async () => {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .limit(1);
        
        if (error) {
          throw new Error(`Users table error: ${error.message}`);
        }
        return `Users table accessible (${data?.length || 0} records)`;
      }
    },
    {
      name: 'Generations Table',
      test: async () => {
        const { data, error } = await supabase
          .from('generations')
          .select('*')
          .limit(1);
        
        if (error) {
          throw new Error(`Generations table error: ${error.message}`);
        }
        return `Generations table accessible (${data?.length || 0} records)`;
      }
    },
    {
      name: 'Media Files Table',
      test: async () => {
        const { data, error } = await supabase
          .from('media_files')
          .select('*')
          .limit(1);
        
        if (error) {
          throw new Error(`Media files table error: ${error.message}`);
        }
        return `Media files table accessible (${data?.length || 0} records)`;
      }
    },
    {
      name: 'Insert Test Generation',
      test: async () => {
        const testGeneration = {
          model: 'test-model',
          prompt: 'Test prompt for database setup verification',
          status: 'completed',
          session_id: `test-session-${Date.now()}`
        };
        
        const { data, error } = await supabase
          .from('generations')
          .insert(testGeneration)
          .select();
        
        if (error) {
          throw new Error(`Insert test failed: ${error.message}`);
        }
        
        return `Test generation inserted successfully (ID: ${data[0]?.id})`;
      }
    },
    {
      name: 'Update Test Generation',
      test: async () => {
        // First, get the test generation we just created
        const { data: generations, error: fetchError } = await supabase
          .from('generations')
          .select('id')
          .eq('model', 'test-model')
          .eq('prompt', 'Test prompt for database setup verification')
          .limit(1);
        
        if (fetchError || !generations?.length) {
          throw new Error(`Could not find test generation: ${fetchError?.message || 'No records found'}`);
        }
        
        const { error } = await supabase
          .from('generations')
          .update({ 
            output_url: 'https://example.com/test-output.mp4',
            status: 'completed'
          })
          .eq('id', generations[0].id);
        
        if (error) {
          throw new Error(`Update test failed: ${error.message}`);
        }
        
        return `Test generation updated successfully`;
      }
    },
    {
      name: 'Cleanup Test Data',
      test: async () => {
        const { error } = await supabase
          .from('generations')
          .delete()
          .eq('model', 'test-model')
          .eq('prompt', 'Test prompt for database setup verification');
        
        if (error) {
          throw new Error(`Cleanup failed: ${error.message}`);
        }
        
        return `Test data cleaned up successfully`;
      }
    }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    console.log(`\n📋 [Database Test] Test ${i + 1}/${totalTests}: ${test.name}`);
    
    try {
      const result = await test.test();
      console.log(`✅ [Database Test] ${test.name}: ${result}`);
      passedTests++;
    } catch (error) {
      console.error(`❌ [Database Test] ${test.name} failed: ${error.message}`);
    }
  }
  
  console.log('\n📊 [Database Test] Test Results:');
  console.log(`   Passed: ${passedTests}/${totalTests}`);
  console.log(`   Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 [Database Test] All tests passed! Database is properly set up.');
    console.log('💡 [Database Test] You can now use the generation API without database errors.');
  } else {
    console.log('\n⚠️  [Database Test] Some tests failed. Please check the database setup.');
    console.log('💡 [Database Test] Run the create-generations-table.sql script in your Supabase SQL Editor.');
  }
  
  return passedTests === totalTests;
}

// Test connection first
async function testConnection() {
  console.log('🔌 [Database Test] Testing database connection...');
  
  try {
    const { data, error } = await supabase
      .from('generations')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ [Database Test] Connection test failed:', error.message);
      return false;
    } else {
      console.log('✅ [Database Test] Database connection successful');
      return true;
    }
  } catch (error) {
    console.error('❌ [Database Test] Connection test error:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🎯 [Database Test] Supabase Database Test Script');
  console.log('===============================================');
  
  // Test connection first
  const isConnected = await testConnection();
  
  if (!isConnected) {
    console.log('\n❌ [Database Test] Cannot connect to database. Please check your environment variables.');
    process.exit(1);
  }
  
  // Run the tests
  const allTestsPassed = await testDatabaseSetup();
  
  if (!allTestsPassed) {
    console.log('\n💡 [Database Test] To fix database issues:');
    console.log('   1. Go to your Supabase dashboard');
    console.log('   2. Navigate to the SQL Editor');
    console.log('   3. Run the SQL from create-generations-table.sql');
    console.log('   4. Run this test script again');
    process.exit(1);
  }
}

// Run the tests
main().catch(console.error);
