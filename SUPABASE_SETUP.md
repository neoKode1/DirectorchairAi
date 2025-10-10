# Supabase Setup Guide for DirectorchairAI

This guide will help you set up Supabase for user authentication and content storage in DirectorchairAI.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A Google Cloud Console project for OAuth (for Google sign-in)

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `directorchair-ai`
   - Database Password: Generate a strong password
   - Region: Choose closest to your users
5. Click "Create new project"

## Step 2: Set Up Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `supabase-schema-production.sql` from the project root
3. Paste it into the SQL Editor and click "Run"
4. This will create all necessary tables, policies, and functions

**Schema Options Available:**
- `supabase-schema-production.sql` - **Recommended**: Production-ready, idempotent, secure
- `supabase-schema-simple.sql` - Basic version for testing
- `supabase-schema.sql` - Original version (may have permission issues)

**Key Features of Production Schema:**
- ✅ **Idempotent**: Can be run multiple times safely
- ✅ **Secure**: Proper RLS policies and permission scoping
- ✅ **Optimized**: Includes performance indexes
- ✅ **Production-ready**: Handles edge cases and conflicts

## Step 3: Configure Authentication

### Enable Google OAuth Provider

1. In Supabase dashboard, go to Authentication > Providers
2. Find Google and click the toggle to enable it
3. You'll need to configure Google OAuth credentials:

### Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Configure OAuth consent screen if prompted
6. For Application type, choose "Web application"
7. Add authorized redirect URIs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
   - `http://localhost:3000/api/auth/callback/google` (for development)
8. Copy the Client ID and Client Secret

### Configure Supabase with Google OAuth

1. Back in Supabase, in the Google provider settings:
   - Paste your Google Client ID
   - Paste your Google Client Secret
   - Click Save

## Step 4: Get Supabase Environment Variables

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - Project URL
   - Anon (public) key
   - Service role key (keep this secret!)

## Step 5: Configure Environment Variables

Create a `.env.local` file in your project root with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# FAL.ai (existing)
FAL_KEY=your_fal_ai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
```

## Step 6: Configure Row Level Security (RLS)

The schema automatically sets up RLS policies, but here's what they do:

- **Users table**: Users can only view and update their own profile
- **Generated content**: Users can only see, create, update, and delete their own content
- **User sessions**: Users can only manage their own session data

## Step 7: Test the Setup

1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000`
3. Click "Sign In" and test Google OAuth
4. Check your Supabase dashboard to see if the user was created
5. Generate some content to test the storage functionality

## Database Schema Overview

### Tables Created

1. **users**
   - Stores user profiles with credits and subscription info
   - Automatically created when users sign up via OAuth

2. **generated_content**
   - Stores all user-generated content (images, videos, audio)
   - Links to users table via user_id

3. **user_sessions**
   - Stores user session data and preferences
   - Used for persisting UI state across sessions

### Key Features

- **Automatic user creation**: New users are automatically added to the database
- **Credit system**: Users start with 10 free credits
- **Content organization**: All generated content is linked to users
- **Secure access**: RLS ensures users only see their own data
- **Session persistence**: User preferences and chat history can be saved

## Content Migration

The app includes automatic migration from localStorage to Supabase:

- When users first sign in, their existing localStorage content is migrated
- This ensures no content is lost during the transition
- Migration happens automatically in the background

## Storage (Optional)

The schema also sets up a Supabase Storage bucket for user uploads:

- Bucket name: `user-content`
- Users can only upload to their own folder
- Useful for storing custom images or other user uploads

## Troubleshooting

### Common Issues

1. **Policy already exists errors**: Use `supabase-schema-production.sql` which is idempotent
2. **Permission denied errors**: The production schema avoids superuser-only operations
3. **OAuth redirect mismatch**: Ensure your redirect URIs match exactly
4. **RLS blocking queries**: Check that your policies are correctly set up
5. **Environment variables**: Make sure all required env vars are set
6. **CORS issues**: Ensure your domain is added to Supabase allowed origins
7. **Auth trigger errors**: The production schema handles user creation via NextAuth callbacks
8. **Re-running schema**: The production schema can be safely run multiple times

### Schema Migration

If you've already run an older schema version:
1. The production schema will detect existing policies and skip them
2. New indexes and improvements will be added automatically
3. No data will be lost during schema updates

### Debugging

- Check Supabase logs in the dashboard
- Use browser dev tools to inspect network requests
- Check the console for authentication errors

## Production Deployment

When deploying to production:

1. Update `NEXTAUTH_URL` to your production domain
2. Add your production domain to Google OAuth authorized origins
3. Add your production domain to Supabase allowed origins
4. Use environment variables in your hosting platform
5. Never expose service role keys in client-side code

## Security Best Practices

1. **Never expose service role key**: Only use it server-side
2. **Use RLS policies**: Always enable and test Row Level Security
3. **Validate inputs**: Sanitize all user inputs before storing
4. **Monitor usage**: Keep track of API usage and user activity
5. **Regular backups**: Set up automated database backups

## Support

If you encounter issues:

1. Check the Supabase documentation
2. Review the DirectorchairAI GitHub issues
3. Join the Supabase Discord community
4. Check the NextAuth.js documentation for auth issues
