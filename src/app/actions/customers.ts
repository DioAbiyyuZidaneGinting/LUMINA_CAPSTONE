"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function getAdminCustomers() {
  try {
    // 1. Fetch Customers records
    const { data: customerData, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (customerError) throw customerError;

    // 2. Fetch Orders summary for active spending metrics
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("total_amount");

    if (ordersError) throw ordersError;

    return {
      success: true,
      customers: customerData || [],
      orders: ordersData || []
    };
  } catch (error: any) {
    console.error("Failed to fetch admin customers:", error);
    return { success: false, error: error.message || "Failed to fetch customers" };
  }
}

export async function addAdminCustomer(customerData: {
  clerk_user_id: string;
  name: string;
  email: string;
  phone: string | null;
  birth_year: number;
  city: string;
}) {
  try {
    // 1. Insert Customer
    const { error: insertError } = await supabase
      .from("customers")
      .insert({
        clerk_user_id: customerData.clerk_user_id,
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        birth_year: customerData.birth_year,
        city: customerData.city,
        total_orders: 0,
        lifetime_value: 0.00
      });

    if (insertError) throw insertError;

    // 2. Log creation telemetry inside activity logs (Fire and forget, table may not exist yet in some environments)
    supabase
      .from("customer_activity_logs")
      .insert({
        clerk_user_id: customerData.clerk_user_id,
        activity_type: "CRM_CREATION",
        metadata: {
          created_by: "Administrator Dashboard",
          timestamp: new Date().toISOString(),
          method: "Manual Form Submission"
        }
      }).then(({ error }) => {
        if (error) console.log("Failed to insert customer activity log (table might not exist):", error.message);
      });

    revalidatePath("/admin/customers");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to insert admin customer:", error);
    return { success: false, error: error.message || "Failed to insert customer" };
  }
}
