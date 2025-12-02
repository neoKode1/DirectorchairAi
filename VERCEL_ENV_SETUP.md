# Vercel Environment Variables Setup

## Required Environment Variables

Add these environment variables to your Vercel project dashboard:

### 1. FAL.ai API Key (REQUIRED)
```
FAL_KEY=your_fal_api_key_here
```
- Get your key from: https://fal.ai/dashboard/keys
- This is required for all AI model generations (images, videos, audio)

### 2. Anthropic Claude API Key (REQUIRED)
```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```
- Get your key from: https://console.anthropic.com/
- Required for chat interface and prompt enhancement features

### 3. Minimax API Key (REQUIRED)
```
MINIMAX_API_KEY=your_minimax_api_key_here
```
- Get your key from: https://platform.minimaxi.com/
- Required for EndFrame video generation and voice features

### 4. NextAuth Configuration (REQUIRED)
```
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
NEXTAUTH_SECRET=your_random_secret_here
```
- Generate a random secret: `openssl rand -base64 32`
- Update NEXTAUTH_URL with your actual Vercel domain

### 5. Supabase Configuration (REQUIRED)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
- Get these from your Supabase project dashboard
- Required for database operations and content storage

### 6. Google OAuth (OPTIONAL - for Google Sign-In)
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```
- Get these from: https://console.cloud.google.com/
- Only needed if you want Google authentication

### 7. Google Cloud Storage (OPTIONAL)
```
GOOGLE_CLOUD_STORAGE_BUCKET=your_bucket_name
GOOGLE_APPLICATION_CREDENTIALS=your_credentials_json
NEXT_PUBLIC_GOOGLE_CLOUD_STORAGE_BUCKET=your_bucket_name
```
- Only needed if using Google Cloud Storage for media files

### 8. PlayHT (OPTIONAL - for additional voice features)
```
PLAYHT_USER_ID=your_playht_user_id
PLAYHT_SECRET_KEY=your_playht_secret_key
```
- Get these from: https://play.ht/
- Only needed for PlayHT voice generation

### 9. UploadThing (OPTIONAL - for file uploads)
```
UPLOADTHING_TOKEN=your_uploadthing_token
```
- Get from: https://uploadthing.com/
- Only needed if using UploadThing for file uploads

### 10. Upstash KV (OPTIONAL - for share functionality)
```
KV_URL=your_upstash_kv_url
KV_REST_API_READ_ONLY_TOKEN=your_readonly_token
KV_REST_API_TOKEN=your_api_token
KV_REST_API_URL=your_rest_api_url
```
- Get from: https://upstash.com/
- Only needed for share button functionality

## How to Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the left sidebar
4. Add each variable one by one:
   - Enter the variable name (e.g., `FAL_KEY`)
   - Enter the variable value
   - Select which environments to apply to (Production, Preview, Development)
5. Click "Save"

## Important Notes

- **Never commit API keys to Git** - They are already in `.gitignore`
- **Rotate keys regularly** for security
- **Use different keys** for development and production if possible
- **Monitor API usage** to avoid unexpected charges
- The exposed MINIMAX_API_KEY in the old `.env.example` has been removed
- Make sure to redeploy after adding environment variables

## Minimum Required Setup

For basic functionality, you need at minimum:
1. `FAL_KEY` - For AI generation
2. `ANTHROPIC_API_KEY` - For chat features
3. `NEXTAUTH_URL` - For authentication
4. `NEXTAUTH_SECRET` - For session security
5. `NEXT_PUBLIC_SUPABASE_URL` - For database
6. `NEXT_PUBLIC_SUPABASE_ANON_KEY` - For database access

## Testing Your Setup

After adding environment variables:
1. Redeploy your Vercel project
2. Test image generation
3. Test chat interface
4. Test video generation
5. Check browser console for any API key errors

## Troubleshooting

- **504 Gateway Timeout**: Video generation can take 5-10 minutes, this is normal
- **422 Content Policy Violation**: The system will automatically try fallback models
- **Missing API Key errors**: Check that all required variables are set in Vercel
- **Authentication issues**: Verify NEXTAUTH_URL matches your domain exactly

