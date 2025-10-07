#!/usr/bin/env node

/**
 * Supabase Integration Test Runner
 * Run this script to test all Supabase functionality
 * 
 * Usage:
 *   node test-supabase.js [test-type]
 * 
 * Test types:
 *   - all (default): Run all tests
 *   - connection: Test basic Supabase connection
 *   - storage: Test storage operations only
 *   - auth: Test authentication only
 *   - integration: Test service integration
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { config } from 'dotenv';

// Test configuration
const TEST_TYPES = {
  all: 'Run all Supabase tests',
  connection: 'Test basic Supabase connection',
  storage: 'Test storage operations only',
  auth: 'Test authentication only',
  integration: 'Test service integration'
};

// Get test type from command line arguments
const testType = process.argv[2] || 'all';

console.log('🧪 [Test Runner] Supabase Integration Test Runner');
console.log('================================================');
console.log(`📋 [Test Runner] Test type: ${testType}`);
console.log(`📝 [Test Runner] Description: ${TEST_TYPES[testType] || 'Unknown test type'}`);
console.log('');

// Validate test type
if (!TEST_TYPES[testType]) {
  console.error(`❌ [Test Runner] Invalid test type: ${testType}`);
  console.error(`📋 [Test Runner] Available test types: ${Object.keys(TEST_TYPES).join(', ')}`);
  process.exit(1);
}

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('❌ [Test Runner] .env.local file not found');
  console.error('📝 [Test Runner] Please create .env.local with your Supabase credentials');
  console.error('📝 [Test Runner] See SUPABASE_SETUP.md for instructions');
  process.exit(1);
}

console.log('✅ [Test Runner] .env.local file found');

// Load environment variables
config({ path: envPath });
console.log('✅ [Test Runner] Environment variables loaded');
console.log('');

// Function to run TypeScript tests
function runTest(testFile) {
  try {
    console.log(`🚀 [Test Runner] Running ${testFile}...`);
    console.log('----------------------------------------');
    
    // Use tsx to run TypeScript files directly with environment variables
    execSync(`npx tsx ${testFile}`, { 
      stdio: 'inherit',
      cwd: process.cwd(),
      env: {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        NEXT_PUBLIC_SUPABASE_STORAGE_URL: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL
      }
    });
    
    console.log('----------------------------------------');
    console.log(`✅ [Test Runner] ${testFile} completed successfully`);
    console.log('');
    
  } catch (error) {
    console.log('----------------------------------------');
    console.error(`❌ [Test Runner] ${testFile} failed`);
    console.error('Error:', error.message);
    console.log('');
    throw error;
  }
}

// Main test execution
async function runTests() {
  const startTime = Date.now();
  
  try {
    switch (testType) {
      case 'connection':
        console.log('🔌 [Test Runner] Running connection tests only...');
        runTest('src/tests/supabase-integration-test.ts');
        break;
        
      case 'storage':
        console.log('💾 [Test Runner] Running storage tests only...');
        runTest('src/tests/supabase-storage-test.ts');
        break;
        
      case 'auth':
        console.log('🔐 [Test Runner] Running authentication tests only...');
        runTest('src/tests/supabase-auth-test.ts');
        break;
        
      case 'integration':
        console.log('🔧 [Test Runner] Running integration tests only...');
        runTest('src/tests/supabase-integration-test.ts');
        break;
        
      case 'all':
      default:
        console.log('🎯 [Test Runner] Running all tests...');
        console.log('');
        
        // Run tests in order
        runTest('src/tests/supabase-integration-test.ts');
        runTest('src/tests/supabase-storage-test.ts');
        runTest('src/tests/supabase-auth-test.ts');
        break;
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('🎉 [Test Runner] ===== ALL TESTS COMPLETED SUCCESSFULLY =====');
    console.log(`⏱️ [Test Runner] Total duration: ${duration}ms`);
    console.log(`📊 [Test Runner] Test type: ${testType}`);
    console.log('');
    console.log('✅ [Test Runner] Supabase integration is working correctly!');
    
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error('💥 [Test Runner] ===== TESTS FAILED =====');
    console.error(`⏱️ [Test Runner] Duration before failure: ${duration}ms`);
    console.error(`📊 [Test Runner] Test type: ${testType}`);
    console.error('');
    console.error('❌ [Test Runner] Please check the error messages above and fix the issues');
    console.error('📝 [Test Runner] Make sure your Supabase configuration is correct');
    console.error('📝 [Test Runner] See SUPABASE_SETUP.md for setup instructions');
    
    process.exit(1);
  }
}

// Run the tests
runTests();
