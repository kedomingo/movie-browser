import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn("Supabase credentials not configured. Caching will be disabled.");
}

export const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

export interface RecommendationCache {
  id: string; // query+kind hash or combination
  query: string;
  kind: "movie" | "tv";
  recommendations: any[]; // TMDB results
  created_at: string;
  expires_at: string;
}

