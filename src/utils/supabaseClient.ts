import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Environment-based redirect URL configuration for signup
const getRedirectUrl = () => {
  if (import.meta.env.DEV) {
    console.log('[getRedirectUrl] DEV mode: using localhost redirect');
    return 'http://localhost:5173/lesson/intro';
  } else {
    const envUrl = import.meta.env.VITE_PRODUCTION_URL;
    const url = envUrl
      ? `${envUrl}/lesson/intro`
      : 'https://captain-spark.vercel.app/lesson/intro';
    console.log('[getRedirectUrl] PROD mode:', {
      VITE_PRODUCTION_URL: envUrl,
      redirectUrl: url
    });
    return url;
  }
};

// Environment-based redirect URL configuration for login
const getLoginRedirectUrl = () => {
  if (import.meta.env.DEV) {
    console.log('[getLoginRedirectUrl] DEV mode: using localhost redirect');
    return 'http://localhost:5173/courses/CourseTrack';
  } else {
    const envUrl = import.meta.env.VITE_PRODUCTION_URL;
    const url = envUrl
      ? `${envUrl}/courses/CourseTrack`
      : 'https://captain-spark.vercel.app/courses/CourseTrack';
    console.log('[getLoginRedirectUrl] PROD mode:', {
      VITE_PRODUCTION_URL: envUrl,
      redirectUrl: url
    });
    return url;
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export the redirect URL functions for use in components
export { getRedirectUrl, getLoginRedirectUrl }; 