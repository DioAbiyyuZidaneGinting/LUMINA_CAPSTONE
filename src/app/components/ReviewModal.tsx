"use client";

import { useState, useEffect } from "react";
import { Star, X } from "lucide-react";
import { submitProductReview, submitStoreReview } from "../actions/reviews";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: {
    type: "product" | "store";
    orderId: string;
    productId?: string;
    productName?: string;
    variant?: string;
    existingReview?: { rating: number; review_text: string; is_anonymous: boolean };
  } | null;
  onSuccess: () => void;
}

export default function ReviewModal({ isOpen, onClose, target, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Populate existing data when modal opens
  useEffect(() => {
    if (isOpen && target?.existingReview) {
      setRating(target.existingReview.rating);
      setReviewText(target.existingReview.review_text);
      setIsAnonymous(target.existingReview.is_anonymous);
    } else if (isOpen) {
      setRating(0);
      setReviewText("");
      setIsAnonymous(false);
    }
  }, [isOpen, target]);

  if (!isOpen || !target) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Silakan berikan rating (1-5 bintang).");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      let res;
      if (target.type === "product" && target.productId) {
        res = await submitProductReview(
          target.productId,
          target.orderId,
          rating,
          reviewText,
          target.variant || "",
          isAnonymous
        );
      } else if (target.type === "store") {
        res = await submitStoreReview(target.orderId, rating, reviewText, isAnonymous);
      }

      if (res?.error) {
        setError(res.error);
      } else {
        onSuccess();
        onClose();
        setRating(0);
        setReviewText("");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg p-8 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-400 hover:text-black transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-black text-black mb-2">
          {target.type === "product" ? "Ulas Produk" : "Ulas Pengalaman Belanja"}
        </h2>
        <p className="text-zinc-500 mb-8 text-sm">
          {target.type === "product" 
            ? `Bagikan pengalaman Anda tentang produk ${target.productName}.`
            : "Ceritakan pengalaman Anda berbelanja di Lumina (pelayanan, pengiriman, dll)."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-black mb-3">Rating Anda</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    size={32}
                    className={`${
                      star <= (hoverRating || rating)
                        ? "text-orange-400 fill-orange-400"
                        : "text-zinc-200"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-3">Komentar</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Ceritakan selengkapnya di sini..."
              className="w-full h-32 p-4 rounded-2xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none"
              required
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isAnonymous ? 'bg-black border-black' : 'bg-white border-zinc-300 group-hover:border-black'}`}>
              {isAnonymous && <X size={12} className="text-white rotate-45" style={{ transform: 'rotate(0)' }} />} 
              {/* Note: Instead of a check icon, a simple fill or X for checkbox. Let's just use a simple div fill */}
              {isAnonymous && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
            </div>
            <input 
              type="checkbox" 
              className="hidden" 
              checked={isAnonymous} 
              onChange={(e) => setIsAnonymous(e.target.checked)} 
            />
            <span className="text-sm font-bold text-zinc-600">Sembunyikan nama saya (Anonymous)</span>
          </label>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-black text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Mengirim..." : "Kirim Ulasan"}
          </button>
        </form>
      </div>
    </div>
  );
}
