import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let clerkTokenResolver: (() => Promise<string | null>) | null = null;

export function setClerkTokenResolver(resolver: (() => Promise<string | null>) | null) {
  clerkTokenResolver = resolver;
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are missing.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: async (url, options: RequestInit = {}) => {
      let clerkToken: string | null = null;
      if (clerkTokenResolver) {
        try {
          clerkToken = await clerkTokenResolver();
        } catch (err) {
          console.error("Failed to resolve Clerk token:", err);
        }
      }

      const headers = new Headers(options.headers);
      if (clerkToken) {
        headers.set("Authorization", `Bearer ${clerkToken}`);
      }

      return fetch(url, {
        ...options,
        headers,
      });
    },
  },
});
