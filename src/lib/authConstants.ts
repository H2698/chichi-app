// Split out from supabaseAdmin.ts (which is server-only and pulls in
// next/server) so client components — the "set a password" forms — can use
// this without accidentally bundling server-only code into the browser.

// Supabase Auth's own default minimum — enforced here too so the client can
// show a clear message before round-tripping to the server.
export const MIN_PASSWORD_LENGTH = 6;
