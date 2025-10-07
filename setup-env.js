import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration based on your storage URL
const supabaseConfig = {
  projectRef: 'oqhrogavwejngvhlauoc',
  url: 'https://oqhrogavwejngvhlauoc.supabase.co',
  storageUrl: 'https://oqhrogavwejngvhlauoc.storage.supabase.co'
};

// Create .env.local file
const envContent = `# Supabase Configuration (Auto-generated)
NEXT_PUBLIC_SUPABASE_URL=${supabaseConfig.url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_SUPABASE_STORAGE_URL=${supabaseConfig.storageUrl}

# Instructions:
# 1. Go to https://supabase.com/dashboard/project/${supabaseConfig.projectRef}/settings/api
# 2. Copy the "anon public" key
# 3. Replace "your_supabase_anon_key_here" with your actual anon key
# 4. Save this file

# Your existing environment variables (if any) should be added below
`;

const envPath = path.join(__dirname, '.env.local');

try {
  // Check if .env.local already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local already exists!');
    console.log('Please manually add these variables to your existing .env.local file:');
    console.log('');
    console.log('NEXT_PUBLIC_SUPABASE_URL=' + supabaseConfig.url);
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here');
    console.log('NEXT_PUBLIC_SUPABASE_STORAGE_URL=' + supabaseConfig.storageUrl);
  } else {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local file with Supabase configuration');
  }
  
  console.log('');
  console.log('🔑 Next steps:');
  console.log('1. Get your Supabase anon key from:');
  console.log(`   https://supabase.com/dashboard/project/${supabaseConfig.projectRef}/settings/api`);
  console.log('2. Replace "your_supabase_anon_key_here" with your actual anon key');
  console.log('3. Run the database schema: supabase-schema.sql in your Supabase dashboard');
  console.log('4. Create a "media-files" bucket in Supabase Storage');
  
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message);
  console.log('');
  console.log('Please manually create .env.local with these variables:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=' + supabaseConfig.url);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here');
  console.log('NEXT_PUBLIC_SUPABASE_STORAGE_URL=' + supabaseConfig.storageUrl);
}
