import ProductCard from '../../components/ProductCard';
import { supabase } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';

export default async function FeaturedPage() {
  // Fetch all products
  const { data: allProducts } = await supabase
    .from('products')
    .select('*');

  // Algorithm: Sort by a mock "sales" score or price to simulate "best-selling items at the top"
  // Since we don't have a real sales_count in the DB yet, we'll sort by price descending as a proxy for "premium best sellers"
  // or a pseudo-random stable sort based on ID.
  const featured = (allProducts || []).sort((a, b) => {
    // Mock algorithm: higher price items are "best sellers" for this demo
    return b.price - a.price; 
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h2 className="text-3xl tracking-tight text-slate-900 mb-2">Produk Unggulan</h2>
        <p className="text-slate-600">Temukan item terlaris dan paling populer dari koleksi kami.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {featured.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
