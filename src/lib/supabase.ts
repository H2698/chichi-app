import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Shared Supabase client. `url`/`key` are the public project URL and
 * publishable (anon) key — safe to ship to the browser as long as Row Level
 * Security policies gate what that key can actually do server-side.
 *
 * When the env vars aren't set (e.g. a local build without `.env.local`),
 * this still constructs a client against placeholder values so the app
 * doesn't crash at import time — network calls will simply fail, and the
 * store's hydrate() falls back to the local seed data in that case.
 */
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  key || "placeholder-key"
);

export const supabaseConfigured = Boolean(url && key);

/**
 * Uploads a photo to the public `dress-photos` storage bucket and returns
 * its public URL. Falls back to a local (session-only) object URL when
 * Supabase isn't configured, so the UI still works in an offline/demo build.
 */
export async function uploadPhoto(file: File, pathPrefix: string): Promise<string> {
  if (!supabaseConfigured) return URL.createObjectURL(file);
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("dress-photos").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) {
    console.error("[supabase] photo upload failed:", error.message);
    return URL.createObjectURL(file);
  }
  const { data } = supabase.storage.from("dress-photos").getPublicUrl(path);
  return data.publicUrl;
}
