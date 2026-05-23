import ProductCard from '../../components/ProductCard';
import { supabase } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';

export default async function NewArrivalsPage() {
  const { data: newArrivals } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  const products = newArrivals || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h2 className="text-3xl tracking-tight text-slate-900 mb-2">Kedatangan Baru</h2>
        <p className="text-slate-600">Temukan tambahan terbaru pada koleksi kami.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
