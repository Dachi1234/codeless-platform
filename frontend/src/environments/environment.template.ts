// Environment configuration template
// Copy this file to environment.ts and environment.prod.ts and add your API keys
// 
// ⚠️ IMPORTANT: These files are COMMITTED to Git and PUBLIC in compiled JavaScript!
//
// ✅ SAFE to add here (client-side, domain-restricted):
//    - TinyMCE API keys (domain-restricted)
//    - Google Maps API keys (domain-restricted)
//    - Stripe Publishable Keys (client-side only)
//    - Firebase config (public, secured by Firebase rules)
//    - Analytics IDs (Google Analytics, etc.)
//
// ❌ NEVER add here (server-side secrets):
//    - Database passwords
//    - JWT secrets
//    - PayPal client secrets
//    - Email service passwords
//    Those belong in backend/codeless-backend/.env (gitignored)
//
export const environment = {
  production: false,
  tinymceApiKey: 'YOUR_TINYMCE_API_KEY_HERE' // Get from https://www.tiny.cloud/
};
