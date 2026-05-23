"use server";

import { createClient } from "@supabase/supabase-js";
import { auth, currentUser } from "@clerk/nextjs/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function submitProductReview(
  productId: string,
  orderId: string,
  rating: number,
  reviewText: string,
  variant: string = "",
  isAnonymous: boolean = false
) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      throw new Error("Unauthorized");
    }

    // Verify order belongs to user and is COMPLETED
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .eq("user_id", userId)
      .single();

    if (orderError || !order) {
      throw new Error("Pesanan tidak ditemukan atau Anda tidak berhak.");
    }

    if (
      order.status.toLowerCase() !== "completed" &&
      order.status.toLowerCase() !== "selesai" &&
      order.status.toLowerCase() !== "paid"
    ) {
      throw new Error("Anda hanya bisa memberi ulasan pada pesanan yang sudah selesai.");
    }

    const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "Customer";
    const userAvatar = user.imageUrl || "";

    const { data: existingReview } = await supabaseAdmin
      .from("product_reviews")
      .select("id")
      .eq("product_id", productId)
      .eq("order_id", orderId)
      .eq("user_id", userId)
      .single();

    if (existingReview) {
      // Update
      const { error: updateError } = await supabaseAdmin
        .from("product_reviews")
        .update({
          rating,
          review_text: reviewText,
          is_anonymous: isAnonymous,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingReview.id);

      if (updateError) throw updateError;
    } else {
      // Insert
      const { error: insertError } = await supabaseAdmin
        .from("product_reviews")
        .insert({
          product_id: productId,
          order_id: orderId,
          user_id: userId,
          user_name: userName,
          user_avatar: userAvatar,
          rating,
          review_text: reviewText,
          variant,
          is_anonymous: isAnonymous
        });

      if (insertError) throw insertError;
    }

    return { success: true };
  } catch (error: any) {
    console.error("[submitProductReview] Error:", error);
    return { success: false, error: error.message || "Gagal mengirim ulasan produk." };
  }
}

export async function submitStoreReview(
  orderId: string,
  rating: number,
  reviewText: string,
  isAnonymous: boolean = false
) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      throw new Error("Unauthorized");
    }

    // Verify order belongs to user and is COMPLETED
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .eq("user_id", userId)
      .single();

    if (orderError || !order) {
      throw new Error("Pesanan tidak ditemukan atau Anda tidak berhak.");
    }

    if (
      order.status.toLowerCase() !== "completed" &&
      order.status.toLowerCase() !== "selesai" &&
      order.status.toLowerCase() !== "paid"
    ) {
      throw new Error("Anda hanya bisa memberi ulasan toko pada pesanan yang sudah selesai.");
    }

    const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "Customer";
    const userAvatar = user.imageUrl || "";

    const { data: existingReview } = await supabaseAdmin
      .from("store_reviews")
      .select("id")
      .eq("order_id", orderId)
      .eq("user_id", userId)
      .single();

    if (existingReview) {
      // Update
      const { error: updateError } = await supabaseAdmin
        .from("store_reviews")
        .update({
          rating,
          review_text: reviewText,
          is_anonymous: isAnonymous,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingReview.id);

      if (updateError) throw updateError;
    } else {
      // Insert
      const { error: insertError } = await supabaseAdmin
        .from("store_reviews")
        .insert({
          order_id: orderId,
          user_id: userId,
          user_name: userName,
          user_avatar: userAvatar,
          rating,
          review_text: reviewText,
          is_anonymous: isAnonymous
        });

      if (insertError) throw insertError;
    }

    return { success: true };
  } catch (error: any) {
    console.error("[submitStoreReview] Error:", error);
    return { success: false, error: error.message || "Gagal mengirim ulasan toko." };
  }
}
