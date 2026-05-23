"use client";

import { useSession } from "@clerk/nextjs";
import { useEffect } from "react";
import { supabase, setClerkTokenResolver } from "../lib/supabase";

/**
 * Custom hook to get the shared authenticated Supabase client singleton.
 * It registers a Clerk token resolver callback that dynamically fetches the fresh
 * Clerk session JWT token (using the 'supabase' JWT template), ensuring auth.uid()
 * in Supabase RLS is in sync with Clerk.
 */
export function useSupabaseClient() {
  const { session } = useSession();

  useEffect(() => {
    if (session) {
      setClerkTokenResolver(() => session.getToken({ template: "supabase" }));
    } else {
      setClerkTokenResolver(null);
    }
  }, [session]);

  return supabase;
}
