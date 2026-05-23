"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { Product } from "./data";
import { toast } from "sonner";
import { telemetry } from "./telemetry";
import { useUser } from "@clerk/nextjs";
import { supabase } from "./supabase";

interface CartItem extends Product {
  quantity: number;
  variantId?: string | null;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, variantId?: string | null) => void;
  removeFromCart: (productId: string | number, variantId?: string | null) => void;
  increaseQuantity: (productId: string | number, variantId?: string | null) => void;
  decreaseQuantity: (productId: string | number, variantId?: string | null) => void;
  clearCart: () => void;
  appliedVoucher: { code: string; discount: number } | null;
  applyVoucher: (code: string, discount: number) => void;
  clearVoucher: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const prevUserRef = useRef<string | null>(null);

  // Initial Load & Auth Sync
  useEffect(() => {
    if (!isLoaded) return;

    const loadCart = async () => {
      if (isSignedIn && user) {
        const currentUserId = user.id;

        if (prevUserRef.current !== currentUserId) {
          // Fetch from Supabase
          const { data, error } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', currentUserId);

          let dbCart: CartItem[] = [];
          if (data && !error) {
            dbCart = data.map((item) => ({
              ...(item.product_data as Product),
              quantity: item.quantity,
              variantId: item.variant_id
            }));
          }

          // Check for guest cart to merge
          const hasGuestCart = localStorage.getItem("store_guest_cart") === "true";
          if (hasGuestCart) {
            const guestCartData = localStorage.getItem("cart");
            if (guestCartData) {
              const guestCart: CartItem[] = JSON.parse(guestCartData);
              const mergedCart = [...dbCart];
              const itemsToUpsert: any[] = [];

              guestCart.forEach(gItem => {
                const existingIdx = mergedCart.findIndex(
                  dItem => dItem.id === gItem.id && dItem.variantId === gItem.variantId
                );
                
                if (existingIdx >= 0) {
                  mergedCart[existingIdx].quantity += gItem.quantity;
                  itemsToUpsert.push({
                    user_id: currentUserId,
                    product_id: mergedCart[existingIdx].id.toString(),
                    variant_id: mergedCart[existingIdx].variantId || null,
                    quantity: mergedCart[existingIdx].quantity,
                    product_data: mergedCart[existingIdx]
                  });
                } else {
                  mergedCart.push(gItem);
                  itemsToUpsert.push({
                    user_id: currentUserId,
                    product_id: gItem.id.toString(),
                    variant_id: gItem.variantId || null,
                    quantity: gItem.quantity,
                    product_data: gItem
                  });
                }
              });

              if (itemsToUpsert.length > 0) {
                await supabase.from('cart_items').upsert(itemsToUpsert, { onConflict: 'user_id,product_id,variant_id' });
              }
              
              setCart(mergedCart);
            }
            localStorage.removeItem("store_guest_cart");
          } else {
            // Normal login or refresh
            setCart(dbCart);
          }
        }
        prevUserRef.current = currentUserId;
      } else {
        if (prevUserRef.current !== null) {
          // User just logged out
          setCart([]);
          localStorage.removeItem("cart");
          localStorage.removeItem("store_guest_cart");
        } else {
          // Initial load as guest
          const savedCart = localStorage.getItem("cart");
          if (savedCart) setCart(JSON.parse(savedCart));
        }
        prevUserRef.current = null;
      }
      setIsCartLoaded(true);
    };

    loadCart();
  }, [isLoaded, isSignedIn, user]);

  // Sync state to localStorage (as cache) and track vouchers
  useEffect(() => {
    if (!isCartLoaded) return;
    
    localStorage.setItem("cart", JSON.stringify(cart));
    if (isLoaded && !isSignedIn && cart.length > 0) {
      localStorage.setItem("store_guest_cart", "true");
    }
  }, [cart, isCartLoaded, isLoaded, isSignedIn]);

  useEffect(() => {
    if (appliedVoucher) {
      localStorage.setItem("appliedVoucher", JSON.stringify(appliedVoucher));
    } else {
      localStorage.removeItem("appliedVoucher");
    }
  }, [appliedVoucher]);

  // Load voucher on mount
  useEffect(() => {
    const savedVoucher = localStorage.getItem("appliedVoucher");
    if (savedVoucher) setAppliedVoucher(JSON.parse(savedVoucher));
  }, []);

  // Database Mutators
  const syncItemToDb = async (item: CartItem, isDelete: boolean = false) => {
    if (!isSignedIn || !user) return;
    
    if (isDelete) {
      let query = supabase.from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', item.id.toString());
        
      if (item.variantId) {
        query = query.eq('variant_id', item.variantId);
      } else {
        query = query.is('variant_id', null);
      }
      
      await query;
    } else {
      await supabase.from('cart_items').upsert({
        user_id: user.id,
        product_id: item.id.toString(),
        variant_id: item.variantId || null,
        quantity: item.quantity,
        product_data: item
      }, { onConflict: 'user_id,product_id,variant_id' });
    }
  };

  const addToCart = (product: Product, variantId?: string | null) => {
    let nextCart = [...cart];
    let updatedItem: CartItem;
    const vId = variantId || null;

    const existingIdx = nextCart.findIndex((item) => item.id === product.id && (item.variantId || null) === vId);
    
    if (existingIdx >= 0) {
      nextCart[existingIdx] = { ...nextCart[existingIdx], quantity: nextCart[existingIdx].quantity + 1 };
      updatedItem = nextCart[existingIdx];
    } else {
      updatedItem = { ...product, quantity: 1, variantId: vId };
      nextCart.push(updatedItem);
    }

    setCart(nextCart);
    syncItemToDb(updatedItem, false);

    try {
      telemetry.track('add_to_cart', { product_id: product.id.toString() });
    } catch (e) {}

    toast.success("Ditambahkan ke Keranjang", {
      description: `${product.name} telah ditambahkan ke keranjang belanja Anda.`,
    });
  };

  const removeFromCart = (productId: string | number, variantId?: string | null) => {
    const vId = variantId || null;
    const itemToRemove = cart.find(i => i.id === productId && (i.variantId || null) === vId);
    if (itemToRemove) {
      const nextCart = cart.filter((item) => !(item.id === productId && (item.variantId || null) === vId));
      setCart(nextCart);
      syncItemToDb(itemToRemove, true);
    }
  };

  const increaseQuantity = (productId: string | number, variantId?: string | null) => {
    const nextCart = [...cart];
    const vId = variantId || null;
    const existingIdx = nextCart.findIndex(i => i.id === productId && (i.variantId || null) === vId);
    
    if (existingIdx >= 0) {
      nextCart[existingIdx] = { ...nextCart[existingIdx], quantity: nextCart[existingIdx].quantity + 1 };
      setCart(nextCart);
      syncItemToDb(nextCart[existingIdx], false);
    }
  };

  const decreaseQuantity = (productId: string | number, variantId?: string | null) => {
    const nextCart = [...cart];
    const vId = variantId || null;
    const existingIdx = nextCart.findIndex(i => i.id === productId && (i.variantId || null) === vId);
    
    if (existingIdx >= 0 && nextCart[existingIdx].quantity > 1) {
      nextCart[existingIdx] = { ...nextCart[existingIdx], quantity: nextCart[existingIdx].quantity - 1 };
      setCart(nextCart);
      syncItemToDb(nextCart[existingIdx], false);
    }
  };

  const clearCart = () => {
    setCart([]);
    setAppliedVoucher(null);
    if (isSignedIn && user) {
      supabase.from('cart_items').delete().eq('user_id', user.id).then();
    }
  };

  const applyVoucher = (code: string, discount: number) => {
    setAppliedVoucher({ code, discount });
  };

  const clearVoucher = () => {
    setAppliedVoucher(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        appliedVoucher,
        applyVoucher,
        clearVoucher,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
