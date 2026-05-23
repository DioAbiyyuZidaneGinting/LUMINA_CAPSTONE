"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function executeSmartRestock(variantId: string, alertLowStockThreshold: number) {
  try {
    if (!variantId) {
      return { success: false, error: "Variant ID is required" };
    }

    // 1. Fetch current stock
    const { data: variant, error: fetchError } = await supabase
      .from("product_variants")
      .select("stock")
      .eq("id", variantId)
      .single();

    if (fetchError || !variant) {
      console.error("Failed to fetch variant stock:", fetchError);
      return { success: false, error: "Variant not found" };
    }

    const previousStock = Number(variant.stock) || 0;
    
    // 2. Smart Calculation: Restock min 20 pcs, or 3x the threshold
    const addedStock = Math.max(20, (alertLowStockThreshold || 5) * 3);
    const newStock = previousStock + addedStock;

    // 3. Update stock in database
    const { error: updateError } = await supabase
      .from("product_variants")
      .update({ stock: newStock })
      .eq("id", variantId);

    if (updateError) {
      console.error("Failed to update stock:", updateError);
      return { success: false, error: "Failed to update stock" };
    }

    // 4. Log the restock (fire and forget, ignore if table doesn't exist yet)
    supabase
      .from("inventory_restock_logs")
      .insert({
        variant_id: variantId,
        previous_stock: previousStock,
        added_stock: addedStock,
        new_stock: newStock
      })
      .then(({ error }) => {
        if (error) console.log("Note: Restock log insert failed (table may not exist):", error.message);
      });

    // 5. Revalidate cache if needed
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/products");

    return { 
      success: true, 
      added: addedStock, 
      newStock: newStock 
    };
  } catch (error: any) {
    console.error("Smart restock error:", error);
    return { success: false, error: error.message || "Internal server error" };
  }
}
