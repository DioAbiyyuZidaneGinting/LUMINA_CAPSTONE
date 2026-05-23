import { supabase } from "../supabase";

export interface ProcessOrderItem {
  product_id: string;
  variant_id: string | null;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  image?: string;
}

export interface ProcessOrderPayload {
  order_number: string;
  user_id: string;
  customer_name: string;
  phone: string;
  address: string;
  customer_address: string;
  city: string;
  total_amount: number;
  discount_amount?: number;
  payment_method: string;
  payment_status: string;
  status: string;
  stock_deducted: boolean;
}

/**
 * Centralized Inventory Pipeline
 * Handles:
 * 1. Atomic decrement of all items
 * 2. Compensating rollback if ANY decrement fails (e.g. out of stock)
 * 3. Order insertion
 * 4. Order items insertion
 */
export async function processOrderTransaction(
  orderPayload: ProcessOrderPayload,
  items: ProcessOrderItem[]
) {
  const decrementedItems: ProcessOrderItem[] = [];

  try {
    // 1. ATOMIC DECREMENT LOOP
    for (const item of items) {
      if (!item.variant_id) {
        console.warn(`Item ${item.name} has no variant_id. Skipping inventory deduction.`);
        continue;
      }

      const quantity = Number(item.quantity);

      console.log(`[processOrderTransaction] Executing decrement_stock_atomic:`);
      console.log(`  - variant_id: ${item.variant_id}`);
      console.log(`  - quantity: ${quantity}`);

      // Call the Postgres RPC
      const { data: success, error } = await supabase.rpc("decrement_stock_atomic", {
        p_variant_id: item.variant_id,
        p_quantity: quantity,
      });

      console.log(`[processOrderTransaction] RPC Response:`, success);

      if (error) {
        console.error(`[processOrderTransaction] RPC Error:`, error);
        throw new Error(`RPC Error for ${item.name}: ${error.message}`);
      }

      if (!success) {
        throw new Error(`Stok tidak mencukupi untuk item: ${item.name}`);
      }

      // Track successful decrements for potential rollback
      decrementedItems.push(item);
    }

    // 2. ORDER INSERTION
    // Force stock_deducted = true to prevent database trigger from double deducting
    const finalOrderPayload = {
      ...orderPayload,
      stock_deducted: true,
    };

    const { data: insertedOrder, error: orderError } = await supabase
      .from("orders")
      .insert([finalOrderPayload])
      .select()
      .single();

    if (orderError) throw orderError;

    // 3. ORDER ITEMS INSERTION
    const orderItemsData = items.map((item) => ({
      order_id: insertedOrder.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsData);

    if (itemsError) {
      // If items fail, we can't easily rollback the parent order natively from JS,
      // but we MUST rollback the stock.
      throw itemsError;
    }

    // 4. DISPATCH REALTIME EVENTS
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("refresh-orders"));
      window.dispatchEvent(new Event("refresh-analytics"));
    }

    return insertedOrder;

  } catch (err: any) {
    console.error("processOrderTransaction failed:", err);

    // COMPENSATING TRANSACTION (ROLLBACK)
    if (decrementedItems.length > 0) {
      console.warn("Melakukan rollback inventaris...");
      for (const item of decrementedItems) {
        if (item.variant_id) {
          const { error: rbError } = await supabase.rpc("increment_stock_atomic", {
            p_variant_id: item.variant_id,
            p_quantity: item.quantity,
          });
          if (rbError) {
            console.error(`CRITICAL: Failed to rollback stock for ${item.name}`, rbError);
          }
        }
      }
    }

    // Re-throw the error to the frontend caller
    throw err;
  }
}
