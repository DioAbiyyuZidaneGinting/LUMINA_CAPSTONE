"use server";

import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

// Initialize Supabase admin client to bypass RLS for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    console.log(`[updateOrderStatus] Updating order ${orderId} to status: ${status}`);

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({ status: status.toLowerCase(), updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .select();

    if (error) {
      console.error("[updateOrderStatus] Supabase Error:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.error("[updateOrderStatus] No rows updated. ID:", orderId);
      throw new Error("Order not found or no rows updated.");
    }
    
    console.log("[updateOrderStatus] Success:", data[0].id);
    return { success: true, data };
  } catch (error: any) {
    console.error("[updateOrderStatus] Fatal Error:", error);
    return { success: false, error: error.message || "Failed to update order status." };
  }
}

export async function updatePaymentStatus(orderId: string, paymentStatus: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    console.log(`[updatePaymentStatus] Updating order ${orderId} to payment_status: ${paymentStatus}`);

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({ payment_status: paymentStatus.toLowerCase(), updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .select();

    if (error) {
      console.error("[updatePaymentStatus] Supabase Error:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.error("[updatePaymentStatus] No rows updated. ID:", orderId);
      throw new Error("Order not found or no rows updated.");
    }
    
    console.log("[updatePaymentStatus] Success:", data[0].id);
    return { success: true, data };
  } catch (error: any) {
    console.error("[updatePaymentStatus] Fatal Error:", error);
    return { success: false, error: error.message || "Failed to update payment status." };
  }
}
