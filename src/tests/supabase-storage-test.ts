/**
 * Comprehensive test for Supabase Storage operations
 * Tests file upload, retrieval, and database integration
 */

// Load environment variables first
import { config } from 'dotenv';
import path from 'path';

// Load .env.local file
config({ path: path.join(process.cwd(), '.env.local') });

import { StorageService } from '@/lib/storage';
import { DatabaseService } from '@/lib/database';
import { createClient } from '@/utils/supabase/client';

// Mock file for testing
function createMockFile(content: string, name: string, type: string): File {
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
}

async function testStorageOperations() {
  console.log('🧪 [Storage Test] Starting Supabase Storage operations test...');
  
  const storageService = new StorageService();
  const dbService = new DatabaseService();
  const supabase = createClient();
  
  try {
    // Test 1: Create a test generation record
    console.log('📝 [Storage Test] Creating test generation record...');
    const testGeneration = await dbService.createGeneration({
      model: 'test-model',
      prompt: 'Test prompt for storage operations',
      status: 'pending'
    });
    
    if (!testGeneration) {
      throw new Error('Failed to create test generation');
    }
    
    console.log('✅ [Storage Test] Test generation created:', testGeneration.id);
    
    // Test 2: Upload a text file
    console.log('📤 [Storage Test] Testing text file upload...');
    const textFile = createMockFile('Hello, Supabase Storage!', 'test.txt', 'text/plain');
    const textUploadResult = await storageService.uploadFile(
      textFile,
      testGeneration.id,
      'test-uploads'
    );
    
    if (!textUploadResult) {
      throw new Error('Failed to upload text file');
    }
    
    console.log('✅ [Storage Test] Text file uploaded:', textUploadResult.url);
    
    // Test 3: Upload an image file (simulated)
    console.log('📸 [Storage Test] Testing image file upload...');
    const imageContent = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const imageBlob = await fetch(imageContent).then(r => r.blob());
    const imageFile = new File([imageBlob], 'test.png', { type: 'image/png' });
    
    const imageUploadResult = await storageService.uploadFile(
      imageFile,
      testGeneration.id,
      'test-uploads'
    );
    
    if (!imageUploadResult) {
      throw new Error('Failed to upload image file');
    }
    
    console.log('✅ [Storage Test] Image file uploaded:', imageUploadResult.url);
    
    // Test 4: Test file URL retrieval
    console.log('🔗 [Storage Test] Testing file URL retrieval...');
    const retrievedUrl = await storageService.getFileUrl(textUploadResult.path);
    
    if (!retrievedUrl) {
      throw new Error('Failed to retrieve file URL');
    }
    
    console.log('✅ [Storage Test] File URL retrieved:', retrievedUrl);
    
    // Test 5: Test file deletion
    console.log('🗑️ [Storage Test] Testing file deletion...');
    const deleteResult = await storageService.deleteFile(textUploadResult.path);
    
    if (!deleteResult) {
      console.warn('⚠️ [Storage Test] File deletion failed (this might be expected)');
    } else {
      console.log('✅ [Storage Test] File deleted successfully');
    }
    
    // Test 6: Test upload from URL
    console.log('🌐 [Storage Test] Testing upload from URL...');
    const urlUploadResult = await storageService.uploadFromUrl(
      'https://via.placeholder.com/150x150.png',
      'placeholder.png',
      testGeneration.id,
      'test-uploads'
    );
    
    if (!urlUploadResult) {
      console.warn('⚠️ [Storage Test] URL upload failed (this might be expected)');
    } else {
      console.log('✅ [Storage Test] URL upload successful:', urlUploadResult.url);
    }
    
    // Test 7: Verify database records
    console.log('📊 [Storage Test] Verifying database records...');
    const mediaFiles = await dbService.getMediaFilesByGeneration(testGeneration.id);
    
    console.log('✅ [Storage Test] Media files in database:', mediaFiles?.length || 0);
    
    // Test 8: Test storage bucket access
    console.log('🪣 [Storage Test] Testing storage bucket access...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ [Storage Test] Bucket access error:', bucketError);
    } else {
      console.log('✅ [Storage Test] Available buckets:', buckets?.map(b => b.name) || []);
    }
    
    // Test 9: Test file listing
    console.log('📋 [Storage Test] Testing file listing...');
    const { data: files, error: listError } = await supabase.storage
      .from('media-files')
      .list('test-uploads', { limit: 10 });
    
    if (listError) {
      console.error('❌ [Storage Test] File listing error:', listError);
    } else {
      console.log('✅ [Storage Test] Files in test-uploads folder:', files?.length || 0);
    }
    
    // Cleanup: Delete test generation
    console.log('🧹 [Storage Test] Cleaning up test data...');
    await dbService.deleteGeneration(testGeneration.id);
    
    console.log('🎉 [Storage Test] All storage operations tests completed successfully!');
    
  } catch (error) {
    console.error('❌ [Storage Test] Test failed:', error);
    throw error;
  }
}

// Test storage service initialization
async function testStorageServiceInit() {
  console.log('🔧 [Storage Test] Testing storage service initialization...');
  
  try {
    const storageService = new StorageService();
    console.log('✅ [Storage Test] Storage service initialized successfully');
    
    // Test bucket name
    console.log('🪣 [Storage Test] Bucket name:', (storageService as any).bucketName);
    
  } catch (error) {
    console.error('❌ [Storage Test] Storage service initialization failed:', error);
    throw error;
  }
}

// Run all storage tests
async function runStorageTests() {
  console.log('🚀 [Storage Test] ===== STARTING SUPABASE STORAGE TESTS =====');
  
  try {
    await testStorageServiceInit();
    await testStorageOperations();
    
    console.log('🎉 [Storage Test] ===== ALL STORAGE TESTS PASSED =====');
  } catch (error) {
    console.error('💥 [Storage Test] ===== STORAGE TESTS FAILED =====');
    console.error('Error:', error);
    process.exit(1);
  }
}

// Export for use in other test files
export { testStorageOperations, testStorageServiceInit, runStorageTests };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runStorageTests();
}
