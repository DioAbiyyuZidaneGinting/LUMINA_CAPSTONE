"use client";
import { useState, useEffect } from 'react';
import { Star, User } from 'lucide-react';
import { Card } from './ui/card';

const MOCK_REVIEWS = [
  { id: 1, name: 'Budi S.', rating: 5, text: 'Kualitas pakaian sangat bagus, pengiriman cepat!', time: 'Baru saja' },
  { id: 2, name: 'Siti M.', rating: 5, text: 'Desain minimalis yang saya cari selama ini. Sangat direkomendasikan.', time: '2 menit yang lalu' },
  { id: 3, name: 'Andi K.', rating: 4, text: 'Bahan nyaman dipakai seharian. Harganya sepadan.', time: '15 menit yang lalu' },
  { id: 4, name: 'Rina W.', rating: 5, text: 'Packaging sangat eksklusif. Terasa seperti produk premium!', time: '1 jam yang lalu' },
];

export default function StoreReviews() {
  const [reviews, setReviews] = useState(MOCK_REVIEWS);

  useEffect(() => {
    // Simulate real-time incoming reviews
    const interval = setInterval(() => {
      const newReview = {
        id: Date.now(),
        name: `User ${Math.floor(Math.random() * 900) + 100}`,
        rating: Math.random() > 0.3 ? 5 : 4,
        text: 'Produk luar biasa! Pasti akan belanja lagi di sini.',
        time: 'Baru saja'
      };
      
      setReviews(prev => {
        const updated = [newReview, ...prev];
        return updated.slice(0, 6); // Keep last 6
      });
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {reviews.slice(0, 4).map((review) => (
        <Card key={review.id} className="p-6 border-zinc-200 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <User className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900 text-sm">{review.name}</p>
                <p className="text-xs text-slate-500">{review.time}</p>
              </div>
            </div>
            <div className="flex text-yellow-400">
              {[...Array(review.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
          </div>
          <p className="text-sm text-slate-600 line-clamp-3">"{review.text}"</p>
        </Card>
      ))}
    </div>
  );
}
