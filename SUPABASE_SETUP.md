# Supabase Setup Guide

## Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://oqhrogavwejngvhlauoc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Supabase Storage
NEXT_PUBLIC_SUPABASE_STORAGE_URL=https://oqhrogavwejngvhlauoc.storage.supabase.co
```

## Getting Your Supabase Anon Key

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to Settings > API
4. Copy the "anon public" key
5. Replace `your_supabase_anon_key_here` with your actual anon key

## Database Setup

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the SQL from `supabase-schema.sql` to create the database tables

## Storage Setup

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `media-files`
3. Set the bucket to public if you want public access to generated media

## Next Steps

1. Add the environment variables to your `.env.local` file
2. Run the database schema SQL in your Supabase dashboard
3. Test the authentication and database integration
