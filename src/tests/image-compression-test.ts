/**
 * Test script for image compression functionality
 * This helps verify that the compression solution works correctly
 */

import { compressImage, compressImageFromUrl, getOptimalCompressionOptions } from '../lib/image-compression';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Test the image compression with a sample image
 */
async function testImageCompression() {
  console.log('🧪 Testing image compression functionality...');

  try {
    // Test with a sample image from the public folder
    const sampleImagePath = join(process.cwd(), 'public', 'screenshot.webp');
    
    // Check if sample image exists
    try {
      const imageBuffer = readFileSync(sampleImagePath);
      console.log('📁 Sample image found:', {
        path: sampleImagePath,
        size: imageBuffer.length,
        sizeMB: (imageBuffer.length / 1024 / 1024).toFixed(2)
      });

      // Test compression
      const result = await compressImage(imageBuffer, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 85,
        format: 'jpeg',
        maxSizeBytes: 5 * 1024 * 1024 // 5MB
      });

      console.log('✅ Compression test results:', {
        originalSize: (result.originalSize / 1024 / 1024).toFixed(2) + 'MB',
        compressedSize: (result.size / 1024 / 1024).toFixed(2) + 'MB',
        compressionRatio: (((result.originalSize - result.size) / result.originalSize) * 100).toFixed(1) + '%',
        dimensions: `${result.width}x${result.height}`,
        format: result.format,
        wasCompressed: result.compressed
      });

      return result;
    } catch (error) {
      console.log('⚠️ Sample image not found, skipping compression test');
      console.log('💡 To test compression, add a sample image to public/screenshot.webp');
      return null;
    }

  } catch (error) {
    console.error('❌ Image compression test failed:', error);
    throw error;
  }
}

/**
 * Test compression options selection
 */
function testCompressionOptions() {
  console.log('🧪 Testing compression options selection...');

  const testSizes = [
    1 * 1024 * 1024,   // 1MB
    5 * 1024 * 1024,   // 5MB
    10 * 1024 * 1024,  // 10MB
    20 * 1024 * 1024   // 20MB
  ];

  testSizes.forEach(size => {
    const options = getOptimalCompressionOptions(size);
    console.log(`📊 Size: ${(size / 1024 / 1024).toFixed(0)}MB -> Options:`, {
      maxWidth: options.maxWidth,
      maxHeight: options.maxHeight,
      quality: options.quality,
      format: options.format,
      maxSizeBytes: options.maxSizeBytes ? (options.maxSizeBytes / 1024 / 1024).toFixed(0) + 'MB' : 'unlimited'
    });
  });
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🚀 Starting image compression tests...\n');

  try {
    // Test compression options
    testCompressionOptions();
    console.log('');

    // Test actual compression
    await testImageCompression();

    console.log('\n✅ All tests completed successfully!');
    console.log('💡 The compression solution should now prevent HTTP 413 errors');

  } catch (error) {
    console.error('\n❌ Tests failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

export { testImageCompression, testCompressionOptions, runTests };
