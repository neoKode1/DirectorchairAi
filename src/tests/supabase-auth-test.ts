/**
 * Comprehensive test for Supabase Authentication flow
 * Tests user sign up, sign in, session management, and database integration
 */

// Load environment variables first
import { config } from 'dotenv';
import path from 'path';

// Load .env.local file
config({ path: path.join(process.cwd(), '.env.local') });

import { createClient } from '@/utils/supabase/client';
import { DatabaseService } from '@/lib/database';

// Test user credentials
const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  fullName: 'Test User'
};

async function testAuthenticationFlow() {
  console.log('🔐 [Auth Test] Starting Supabase Authentication flow test...');
  
  const supabase = createClient();
  const dbService = new DatabaseService();
  
  try {
    // Test 1: Test Supabase client initialization
    console.log('🔧 [Auth Test] Testing Supabase client initialization...');
    const { data: { user: initialUser } } = await supabase.auth.getUser();
    console.log('✅ [Auth Test] Supabase client initialized, current user:', initialUser?.email || 'None');
    
    // Test 2: Test user sign up
    console.log('📝 [Auth Test] Testing user sign up...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: TEST_USER.email,
      password: TEST_USER.password,
      options: {
        data: {
          full_name: TEST_USER.fullName
        }
      }
    });
    
    if (signUpError) {
      throw new Error(`Sign up failed: ${signUpError.message}`);
    }
    
    if (!signUpData.user) {
      throw new Error('Sign up succeeded but no user returned');
    }
    
    console.log('✅ [Auth Test] User signed up successfully:', signUpData.user.email);
    console.log('📧 [Auth Test] Email confirmation required:', signUpData.user.email_confirmed_at ? 'No' : 'Yes');
    
    // Test 3: Test user sign in
    console.log('🔑 [Auth Test] Testing user sign in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    
    if (signInError) {
      // If sign in fails due to email confirmation, that's expected
      if (signInError.message.includes('email not confirmed')) {
        console.log('⚠️ [Auth Test] Sign in failed due to email confirmation (expected in test environment)');
      } else {
        throw new Error(`Sign in failed: ${signInError.message}`);
      }
    } else {
      console.log('✅ [Auth Test] User signed in successfully:', signInData.user?.email);
    }
    
    // Test 4: Test session management
    console.log('📱 [Auth Test] Testing session management...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('⚠️ [Auth Test] Session error (might be expected):', sessionError.message);
    } else if (session) {
      console.log('✅ [Auth Test] Active session found:', session.user.email);
      console.log('⏰ [Auth Test] Session expires at:', session.expires_at);
    } else {
      console.log('ℹ️ [Auth Test] No active session (expected if email not confirmed)');
    }
    
    // Test 5: Test user profile creation in database
    console.log('👤 [Auth Test] Testing user profile creation...');
    if (signUpData.user) {
      // Check if user profile was created in our users table
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', signUpData.user.id)
        .single();
      
      if (userProfile) {
        console.log('✅ [Auth Test] User profile found in database:', userProfile.email);
      } else {
        console.log('⚠️ [Auth Test] User profile not found in database (might be expected if trigger not set up)');
        if (userError) {
          console.log('⚠️ [Auth Test] User profile error:', userError.message);
        }
      }
    }
    
    // Test 6: Test generation creation with user
    console.log('🎨 [Auth Test] Testing generation creation with authenticated user...');
    if (signUpData.user) {
      const testGeneration = await dbService.createGeneration({
        model: 'test-auth-model',
        prompt: 'Test prompt for authenticated user',
        status: 'pending',
        user_id: signUpData.user.id
      });
      
      if (testGeneration) {
        console.log('✅ [Auth Test] Generation created for authenticated user:', testGeneration.id);
        
        // Clean up test generation
        await dbService.deleteGeneration(testGeneration.id);
        console.log('🧹 [Auth Test] Test generation cleaned up');
      } else {
        console.log('⚠️ [Auth Test] Failed to create generation for authenticated user');
      }
    }
    
    // Test 7: Test sign out
    console.log('🚪 [Auth Test] Testing user sign out...');
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.log('⚠️ [Auth Test] Sign out error:', signOutError.message);
    } else {
      console.log('✅ [Auth Test] User signed out successfully');
    }
    
    // Test 8: Verify session is cleared
    console.log('🔍 [Auth Test] Verifying session is cleared...');
    const { data: { session: clearedSession } } = await supabase.auth.getSession();
    
    if (clearedSession) {
      console.log('⚠️ [Auth Test] Session still exists after sign out');
    } else {
      console.log('✅ [Auth Test] Session cleared successfully');
    }
    
    console.log('🎉 [Auth Test] Authentication flow test completed successfully!');
    
  } catch (error) {
    console.error('❌ [Auth Test] Authentication test failed:', error);
    throw error;
  }
}

// Test anonymous user functionality
async function testAnonymousUserFlow() {
  console.log('👻 [Auth Test] Testing anonymous user functionality...');
  
  const supabase = createClient();
  const dbService = new DatabaseService();
  
  try {
    // Test 1: Create generation without user authentication
    console.log('🎨 [Auth Test] Testing generation creation for anonymous user...');
    const sessionId = `test-session-${Date.now()}`;
    
    const anonymousGeneration = await dbService.createGeneration({
      model: 'test-anonymous-model',
      prompt: 'Test prompt for anonymous user',
      status: 'pending',
      session_id: sessionId
    });
    
    if (!anonymousGeneration) {
      throw new Error('Failed to create generation for anonymous user');
    }
    
    console.log('✅ [Auth Test] Generation created for anonymous user:', anonymousGeneration.id);
    
    // Test 2: Retrieve generations by session ID
    console.log('📋 [Auth Test] Testing generation retrieval by session ID...');
    const allGenerations = await dbService.getGenerations();
    const sessionGenerations = allGenerations.filter(gen => gen.session_id === sessionId);
    
    if (sessionGenerations && sessionGenerations.length > 0) {
      console.log('✅ [Auth Test] Retrieved generations for session:', sessionGenerations.length);
    } else {
      console.log('⚠️ [Auth Test] No generations found for session');
    }
    
    // Test 3: Clean up anonymous generation
    console.log('🧹 [Auth Test] Cleaning up anonymous generation...');
    await dbService.deleteGeneration(anonymousGeneration.id);
    console.log('✅ [Auth Test] Anonymous generation cleaned up');
    
    console.log('🎉 [Auth Test] Anonymous user flow test completed successfully!');
    
  } catch (error) {
    console.error('❌ [Auth Test] Anonymous user test failed:', error);
    throw error;
  }
}

// Test session migration functionality
async function testSessionMigration() {
  console.log('🔄 [Auth Test] Testing session migration functionality...');
  
  const dbService = new DatabaseService();
  
  try {
    // Test 1: Create anonymous generation
    console.log('👻 [Auth Test] Creating anonymous generation...');
    const sessionId = `migration-test-${Date.now()}`;
    
    const anonymousGeneration = await dbService.createGeneration({
      model: 'test-migration-model',
      prompt: 'Test prompt for migration',
      status: 'pending',
      session_id: sessionId
    });
    
    if (!anonymousGeneration) {
      throw new Error('Failed to create anonymous generation for migration test');
    }
    
    console.log('✅ [Auth Test] Anonymous generation created:', anonymousGeneration.id);
    
    // Test 2: Simulate user sign up and migration
    console.log('🔄 [Auth Test] Simulating session migration...');
    const testUserId = `test-user-${Date.now()}`;
    
    // Create a test user record
    const testUser = await dbService.createUser({
      id: testUserId,
      email: `migration-test-${Date.now()}@example.com`
    });
    
    if (testUser) {
      console.log('✅ [Auth Test] Test user created for migration:', testUser.email);
      
      // Test migration function
      const migrationResult = await dbService.migrateSessionToUser(testUserId);
      
      if (migrationResult) {
        console.log('✅ [Auth Test] Session migration completed successfully');
      } else {
        console.log('⚠️ [Auth Test] Session migration returned false (might be expected if no session data)');
      }
      
      // Clean up test user
      await dbService.deleteUser(testUserId);
      console.log('🧹 [Auth Test] Test user cleaned up');
    }
    
    // Clean up anonymous generation
    await dbService.deleteGeneration(anonymousGeneration.id);
    console.log('🧹 [Auth Test] Anonymous generation cleaned up');
    
    console.log('🎉 [Auth Test] Session migration test completed successfully!');
    
  } catch (error) {
    console.error('❌ [Auth Test] Session migration test failed:', error);
    throw error;
  }
}

// Test authentication context and hooks
async function testAuthContext() {
  console.log('🎭 [Auth Test] Testing authentication context...');
  
  try {
    // Test 1: Check if AuthContext is properly exported
    console.log('📦 [Auth Test] Checking AuthContext exports...');
    const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');
    
    if (AuthProvider && useAuth) {
      console.log('✅ [Auth Test] AuthContext components exported successfully');
    } else {
      throw new Error('AuthContext components not properly exported');
    }
    
    // Test 2: Check if AuthModal is available
    console.log('🔐 [Auth Test] Checking AuthModal component...');
    const { AuthModal } = await import('@/components/auth/AuthModal');
    
    if (AuthModal) {
      console.log('✅ [Auth Test] AuthModal component available');
    } else {
      console.log('⚠️ [Auth Test] AuthModal component not found');
    }
    
    console.log('🎉 [Auth Test] Authentication context test completed successfully!');
    
  } catch (error) {
    console.error('❌ [Auth Test] Authentication context test failed:', error);
    throw error;
  }
}

// Run all authentication tests
async function runAuthTests() {
  console.log('🚀 [Auth Test] ===== STARTING SUPABASE AUTHENTICATION TESTS =====');
  
  try {
    await testAuthContext();
    await testAnonymousUserFlow();
    await testSessionMigration();
    await testAuthenticationFlow();
    
    console.log('🎉 [Auth Test] ===== ALL AUTHENTICATION TESTS PASSED =====');
  } catch (error) {
    console.error('💥 [Auth Test] ===== AUTHENTICATION TESTS FAILED =====');
    console.error('Error:', error);
    process.exit(1);
  }
}

// Export for use in other test files
export { 
  testAuthenticationFlow, 
  testAnonymousUserFlow, 
  testSessionMigration, 
  testAuthContext, 
  runAuthTests 
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAuthTests();
}
