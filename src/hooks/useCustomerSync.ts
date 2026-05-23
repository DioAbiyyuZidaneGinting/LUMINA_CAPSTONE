"use client";

import { useUser } from "@clerk/nextjs";
import { useSupabaseClient } from "./useSupabaseClient";
import { useEffect, useRef } from "react";

/**
 * useCustomerSync
 * 
 * ⚠️ TEMPORARY MVP/LOCAL SYNC STRATEGY
 * Automatically synchronizes a newly signed-up or logged-in Clerk user with the Supabase `customers` table.
 * Also registers telemetry events inside the `customer_activity_logs` table.
 * 
 * Production Recommendation:
 * For live deployments, this client-side sync should be migrated to a server-side Clerk Webhook
 * handler (Clerk Webhook -> API Route -> Supabase Service Role Client) to maximize security and stability.
 */
export function useCustomerSync() {
  const { user, isSignedIn } = useUser();
  const supabase = useSupabaseClient();
  const syncInProgress = useRef<boolean>(false);

  useEffect(() => {
    if (!isSignedIn || !user || syncInProgress.current) return;

    const syncKey = `lumina_crm_sync_${user.id}`;
    // Optimize network requests: Skip if session already checked
    if (typeof window !== "undefined" && sessionStorage.getItem(syncKey)) return;

    const performSync = async () => {
      syncInProgress.current = true;
      try {
        console.log(`🔄 [CRM Sync] Checking registration for Clerk User: ${user.id}`);

        // 1. SELECT query to verify if profile exists in customers table
        const { data: existingCustomer, error: selectError } = await (supabase as any)
          .from("customers")
          .select("clerk_user_id, name")
          .eq("clerk_user_id", user.id)
          .maybeSingle();

        if (selectError) throw selectError;

        let finalName = user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Pelanggan Lumina";
        let email = user.primaryEmailAddress?.emailAddress || "";
        let phone = user.primaryPhoneNumber?.phoneNumber || "";

        // Extract birth year if set in Clerk metadata, fallback to a dynamic standard (e.g. 1995 for Millennial / 2000 for Gen Z)
        let birthYear = 2000;
        if (user.unsafeMetadata?.birthYear) {
          birthYear = Number(user.unsafeMetadata.birthYear);
        } else if (user.unsafeMetadata?.birth_year) {
          birthYear = Number(user.unsafeMetadata.birth_year);
        }

        // 2. Insert user into customers if they don't exist yet
        if (!existingCustomer) {
          console.log(`🆕 [CRM Sync] User not detected in Supabase. Registering profile...`);
          const { error: insertError } = await (supabase as any)
            .from("customers")
            .insert({
              clerk_user_id: user.id,
              name: finalName,
              email: email,
              phone: phone,
              birth_year: birthYear,
              city: "Jakarta" // Default signup fallback city
            });

          if (insertError) throw insertError;
          console.log(`✅ [CRM Sync] Successfully created profile in customers table.`);
        } else {
          console.log(`ℹ️ [CRM Sync] Profile detected. Skipping registration insert.`);
        }

        // 3. Log the sync/login action inside customer_activity_logs for analytics telemetry
        const { error: logError } = await (supabase as any)
          .from("customer_activity_logs")
          .insert({
            clerk_user_id: user.id,
            activity_type: "LOGIN",
            metadata: {
              email: email,
              name: finalName,
              timestamp: new Date().toISOString(),
              client: "Lumina OS Storefront"
            }
          });

        if (logError) {
          console.warn("⚠️ [CRM Sync] Failed to write log inside customer_activity_logs:", logError.message);
        } else {
          console.log("📈 [CRM Sync] Telemetry activity logged successfully.");
        }

        // Save session indicator to prevent redundant updates on component re-mounts
        if (typeof window !== "undefined") {
          sessionStorage.setItem(syncKey, "true");
        }
      } catch (err: any) {
        console.error("❌ [CRM Sync] Relational synchronization error:", err.message || err);
      } finally {
        syncInProgress.current = false;
      }
    };

    performSync();
  }, [user, isSignedIn, supabase]);
}
