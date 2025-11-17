import { z } from 'zod';

/**
 * Environment variable validation schema
 * Validates all required environment variables at startup
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Supabase (required)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // NextAuth (required in production)
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters').optional(),

  // Google OAuth (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // FAL.ai (required for AI generation)
  FAL_KEY: z.string().min(1, 'FAL_KEY is required for AI generation'),

  // Google Cloud Storage (optional)
  GOOGLE_CLOUD_STORAGE_BUCKET: z.string().optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),

  // PlayHT (optional)
  PLAYHT_USER_ID: z.string().optional(),
  PLAYHT_SECRET_KEY: z.string().optional(),

  // UploadThing (optional)
  UPLOADTHING_TOKEN: z.string().optional(),

  // Upstash KV (optional - for sharing features)
  KV_URL: z.string().url().optional(),
  KV_REST_API_URL: z.string().url().optional(),
  KV_REST_API_TOKEN: z.string().optional(),
  KV_REST_API_READ_ONLY_TOKEN: z.string().optional(),

  // Auth bypass flag (development only)
  NEXT_PUBLIC_DISABLE_AUTH: z.enum(['true', 'false']).optional(),
});

/**
 * Validated environment variables
 * Use this instead of process.env to ensure type safety and validation
 */
export const env = (() => {
  try {
    const parsed = envSchema.parse(process.env);
    
    // Additional validation for production
    if (parsed.NODE_ENV === 'production') {
      if (!parsed.NEXTAUTH_URL) {
        throw new Error('NEXTAUTH_URL is required in production');
      }
      if (!parsed.NEXTAUTH_SECRET) {
        throw new Error('NEXTAUTH_SECRET is required in production');
      }
      if (parsed.NEXT_PUBLIC_DISABLE_AUTH === 'true') {
        throw new Error('Cannot disable auth in production');
      }
    }

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment variable validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Invalid environment variables. Check .env.example for required variables.');
    }
    throw error;
  }
})();

/**
 * Type-safe environment variables
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Check if a specific feature is enabled based on environment variables
 */
export const features = {
  googleOAuth: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
  googleCloudStorage: !!(env.GOOGLE_CLOUD_STORAGE_BUCKET && env.GOOGLE_APPLICATION_CREDENTIALS),
  playHT: !!(env.PLAYHT_USER_ID && env.PLAYHT_SECRET_KEY),
  uploadThing: !!env.UPLOADTHING_TOKEN,
  upstashKV: !!(env.KV_URL && env.KV_REST_API_TOKEN),
  authDisabled: env.NODE_ENV === 'development' || env.NEXT_PUBLIC_DISABLE_AUTH === 'true',
} as const;

/**
 * Log environment configuration on startup (development only)
 */
if (env.NODE_ENV === 'development') {
  console.log('🔧 Environment Configuration:');
  console.log('  - Node Environment:', env.NODE_ENV);
  console.log('  - Supabase URL:', env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('  - FAL.ai:', env.FAL_KEY ? '✅ Configured' : '❌ Missing');
  console.log('  - Google OAuth:', features.googleOAuth ? '✅ Enabled' : '⚠️  Disabled');
  console.log('  - Google Cloud Storage:', features.googleCloudStorage ? '✅ Enabled' : '⚠️  Disabled');
  console.log('  - PlayHT:', features.playHT ? '✅ Enabled' : '⚠️  Disabled');
  console.log('  - UploadThing:', features.uploadThing ? '✅ Enabled' : '⚠️  Disabled');
  console.log('  - Upstash KV:', features.upstashKV ? '✅ Enabled' : '⚠️  Disabled');
  console.log('  - Auth:', features.authDisabled ? '🔓 Disabled' : '🔒 Enabled');
}

