/**
 * Comprehensive integration test for Supabase
 * Combines storage operations, authentication, and database functionality
 */

// Load environment variables first
import { config } from 'dotenv';
import path from 'path';

// Load .env.local file
config({ path: path.join(process.cwd(), '.env.local') });

import { runStorageTests } from './supabase-storage-test';
import { runAuthTests } from './supabase-auth-test';
import { createClient } from '@/utils/supabase/client';
import { DatabaseService } from '@/lib/database';
import { StorageService } from '@/lib/storage';

// Test configuration
const TEST_CONFIG = {
  timeout: 30000, // 30 seconds timeout for all tests
  cleanup: true,  // Clean up test data after tests
};

async function testSupabaseConnection() {
  console.log('🔌 [Integration Test] Testing Supabase connection...');
  
  try {
    const supabase = createClient();
    
    // Test 1: Database connection
    console.log('🗄️ [Integration Test] Testing database connection...');
    const { data: dbTest, error: dbError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (dbError) {
      throw new Error(`Database connection failed: ${dbError.message}`);
    }
    
    console.log('✅ [Integration Test] Database connection successful');
    
    // Test 2: Storage connection
    console.log('💾 [Integration Test] Testing storage connection...');
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    
    if (storageError) {
      throw new Error(`Storage connection failed: ${storageError.message}`);
    }
    
    console.log('✅ [Integration Test] Storage connection successful');
    console.log('📦 [Integration Test] Available buckets:', buckets?.map(b => b.name) || []);
    
    // Test 3: Auth connection
    console.log('🔐 [Integration Test] Testing auth connection...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      throw new Error(`Auth connection failed: ${authError.message}`);
    }
    
    console.log('✅ [Integration Test] Auth connection successful');
    console.log('👤 [Integration Test] Current user:', user?.email || 'None (anonymous)');
    
    return true;
  } catch (error) {
    console.error('❌ [Integration Test] Supabase connection test failed:', error);
    throw error;
  }
}

async function testServiceIntegration() {
  console.log('🔧 [Integration Test] Testing service integration...');
  
  try {
    // Test 1: Database service initialization
    console.log('🗄️ [Integration Test] Testing database service...');
    const dbService = new DatabaseService();
    console.log('✅ [Integration Test] Database service initialized');
    
    // Test 2: Storage service initialization
    console.log('💾 [Integration Test] Testing storage service...');
    const storageService = new StorageService();
    console.log('✅ [Integration Test] Storage service initialized');
    
    // Test 3: Service interaction
    console.log('🔄 [Integration Test] Testing service interaction...');
    
    // Create a test generation
    const testGeneration = await dbService.createGeneration({
      model: 'integration-test-model',
      prompt: 'Integration test prompt',
      status: 'pending'
    });
    
    if (!testGeneration) {
      throw new Error('Failed to create test generation');
    }
    
    console.log('✅ [Integration Test] Test generation created:', testGeneration.id);
    
    // Create a mock file and upload it
    const mockFile = new File(['Integration test content'], 'integration-test.txt', { 
      type: 'text/plain' 
    });
    
    const uploadResult = await storageService.uploadFile(
      mockFile,
      testGeneration.id,
      'integration-tests'
    );
    
    if (!uploadResult) {
      throw new Error('Failed to upload test file');
    }
    
    console.log('✅ [Integration Test] Test file uploaded:', uploadResult.url);
    
    // Verify the file was recorded in the database
    const mediaFiles = await dbService.getMediaFilesByGeneration(testGeneration.id);
    
    if (mediaFiles && mediaFiles.length > 0) {
      console.log('✅ [Integration Test] File metadata recorded in database');
    } else {
      console.log('⚠️ [Integration Test] File metadata not found in database');
    }
    
    // Clean up
    if (TEST_CONFIG.cleanup) {
      console.log('🧹 [Integration Test] Cleaning up test data...');
      await dbService.deleteGeneration(testGeneration.id);
      console.log('✅ [Integration Test] Test data cleaned up');
    }
    
    console.log('🎉 [Integration Test] Service integration test completed successfully!');
    
  } catch (error) {
    console.error('❌ [Integration Test] Service integration test failed:', error);
    throw error;
  }
}

async function testEndToEndWorkflow() {
  console.log('🔄 [Integration Test] Testing end-to-end workflow...');
  
  try {
    const dbService = new DatabaseService();
    const storageService = new StorageService();
    const supabase = createClient();
    
    // Step 1: Create anonymous generation
    console.log('👻 [Integration Test] Step 1: Creating anonymous generation...');
    const sessionId = `e2e-test-${Date.now()}`;
    
    const generation = await dbService.createGeneration({
      model: 'fal-ai/flux-pro',
      prompt: 'A beautiful sunset over mountains',
      status: 'pending',
      sessionId: sessionId
    });
    
    if (!generation) {
      throw new Error('Failed to create generation');
    }
    
    console.log('✅ [Integration Test] Generation created:', generation.id);
    
    // Step 2: Simulate file upload (mock)
    console.log('📤 [Integration Test] Step 2: Simulating file upload...');
    const mockImageFile = new File(['Mock image data'], 'test-image.png', { 
      type: 'image/png' 
    });
    
    const uploadResult = await storageService.uploadFile(
      mockImageFile,
      generation.id,
      'e2e-tests'
    );
    
    if (!uploadResult) {
      throw new Error('Failed to upload mock file');
    }
    
    console.log('✅ [Integration Test] File uploaded:', uploadResult.url);
    
    // Step 3: Update generation status
    console.log('📝 [Integration Test] Step 3: Updating generation status...');
    const updatedGeneration = await dbService.updateGeneration(generation.id, {
      status: 'completed',
      output_url: uploadResult.url
    });
    
    if (!updatedGeneration) {
      throw new Error('Failed to update generation');
    }
    
    console.log('✅ [Integration Test] Generation status updated to:', updatedGeneration.status);
    
    // Step 4: Retrieve generation with media files
    console.log('📋 [Integration Test] Step 4: Retrieving generation with media files...');
    const retrievedGeneration = await dbService.getGeneration(generation.id);
    const mediaFiles = await dbService.getMediaFilesByGeneration(generation.id);
    
    if (retrievedGeneration && mediaFiles) {
      console.log('✅ [Integration Test] Generation and media files retrieved successfully');
      console.log('📊 [Integration Test] Media files count:', mediaFiles.length);
    } else {
      throw new Error('Failed to retrieve generation or media files');
    }
    
    // Step 5: Test session-based retrieval
    console.log('🔍 [Integration Test] Step 5: Testing session-based retrieval...');
    const sessionGenerations = await dbService.getGenerationsBySession(sessionId);
    
    if (sessionGenerations && sessionGenerations.length > 0) {
      console.log('✅ [Integration Test] Session-based retrieval successful');
    } else {
      throw new Error('Failed to retrieve generations by session');
    }
    
    // Clean up
    if (TEST_CONFIG.cleanup) {
      console.log('🧹 [Integration Test] Cleaning up end-to-end test data...');
      await dbService.deleteGeneration(generation.id);
      console.log('✅ [Integration Test] End-to-end test data cleaned up');
    }
    
    console.log('🎉 [Integration Test] End-to-end workflow test completed successfully!');
    
  } catch (error) {
    console.error('❌ [Integration Test] End-to-end workflow test failed:', error);
    throw error;
  }
}

async function testErrorHandling() {
  console.log('⚠️ [Integration Test] Testing error handling...');
  
  try {
    const dbService = new DatabaseService();
    const storageService = new StorageService();
    
    // Test 1: Invalid generation ID
    console.log('🔍 [Integration Test] Testing invalid generation ID...');
    const invalidGeneration = await dbService.getGeneration('invalid-id');
    
    if (invalidGeneration === null) {
      console.log('✅ [Integration Test] Invalid generation ID handled correctly');
    } else {
      console.log('⚠️ [Integration Test] Invalid generation ID returned unexpected result');
    }
    
    // Test 2: Invalid file upload
    console.log('📤 [Integration Test] Testing invalid file upload...');
    const invalidFile = new File([''], '', { type: '' });
    const invalidUpload = await storageService.uploadFile(invalidFile, 'invalid-id');
    
    if (invalidUpload === null) {
      console.log('✅ [Integration Test] Invalid file upload handled correctly');
    } else {
      console.log('⚠️ [Integration Test] Invalid file upload returned unexpected result');
    }
    
    // Test 3: Database constraint violations
    console.log('🗄️ [Integration Test] Testing database constraint violations...');
    try {
      await dbService.createGeneration({
        model: '', // Empty model should fail
        prompt: 'Test prompt',
        status: 'pending'
      });
      console.log('⚠️ [Integration Test] Empty model was accepted (unexpected)');
    } catch (error) {
      console.log('✅ [Integration Test] Empty model rejected correctly');
    }
    
    console.log('🎉 [Integration Test] Error handling test completed successfully!');
    
  } catch (error) {
    console.error('❌ [Integration Test] Error handling test failed:', error);
    throw error;
  }
}

// Main integration test runner
async function runIntegrationTests() {
  console.log('🚀 [Integration Test] ===== STARTING SUPABASE INTEGRATION TESTS =====');
  console.log(`⏱️ [Integration Test] Timeout: ${TEST_CONFIG.timeout}ms`);
  console.log(`🧹 [Integration Test] Cleanup: ${TEST_CONFIG.cleanup ? 'Enabled' : 'Disabled'}`);
  
  const startTime = Date.now();
  
  try {
    // Test 1: Basic connection
    await testSupabaseConnection();
    
    // Test 2: Service integration
    await testServiceIntegration();
    
    // Test 3: End-to-end workflow
    await testEndToEndWorkflow();
    
    // Test 4: Error handling
    await testErrorHandling();
    
    // Test 5: Individual component tests
    console.log('🧪 [Integration Test] Running individual component tests...');
    await runStorageTests();
    await runAuthTests();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('🎉 [Integration Test] ===== ALL INTEGRATION TESTS PASSED =====');
    console.log(`⏱️ [Integration Test] Total duration: ${duration}ms`);
    
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error('💥 [Integration Test] ===== INTEGRATION TESTS FAILED =====');
    console.error(`⏱️ [Integration Test] Duration before failure: ${duration}ms`);
    console.error('Error:', error);
    process.exit(1);
  }
}

// Export for use in other test files
export { 
  testSupabaseConnection,
  testServiceIntegration,
  testEndToEndWorkflow,
  testErrorHandling,
  runIntegrationTests
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runIntegrationTests();
}
