import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Environment-based redirect URL configuration
const getRedirectUrl = () => {
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    // Use localhost for development
    return 'http://localhost:5173/lesson/intro';
  } else {
    // Use production URL for deployed version
    // You can set this as an environment variable or use a default
    return import.meta.env.VITE_PRODUCTION_URL 
      ? `${import.meta.env.VITE_PRODUCTION_URL}/lesson/intro`
      : 'https://captain-spark.vercel.app/lesson/intro'; // Default Vercel deployment URL
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export the redirect URL function for use in components
export { getRedirectUrl }; 