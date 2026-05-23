"use client";
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { MapPin, Package, LogOut, User, Star } from 'lucide-react';
import { useClerk, useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { formatIDR } from '../../components/ui/utils';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ProfilePage() {
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in?redirect_url=/profile');
    }
  }, [isLoaded, user, router]);
  const [activeTab, setActiveTab] = useState('account');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [ratedOrders, setRatedOrders] = useState<Record<number, number>>({});

  // Profile Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (isLoaded && user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone((user.unsafeMetadata.phone as string) || '');
      setAddress((user.unsafeMetadata.address as string) || '');
      fetchOrders();
    }
  }, [isLoaded, user]);

  const fetchOrders = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          quantity,
          price,
          product_id,
          products (
            name,
            product_images (
              image_url
            )
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching profile orders:", error);
      return;
    }

    if (data) {
      const formattedData = data.map((order: any) => {
        const items = order.order_items?.map((item: any) => ({
          product_id: item.product_id,
          name: item.products?.name || "Produk Lumina",
          quantity: item.quantity,
          price: item.price,
          image: item.products?.product_images?.[0]?.image_url
        })) || [];
        return { ...order, items };
      });
      setOrders(formattedData);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      await user.update({
        firstName,
        lastName,
        unsafeMetadata: {
          ...user.unsafeMetadata,
          phone,
          address
        }
      });
      setIsEditing(false);
      toast.success('Profil berhasil diperbarui');
    } catch (error: any) {
      toast.error('Gagal memperbarui profil', { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkDelivered = async (orderId: number) => {
    const { error } = await supabase.from('orders').update({ status: 'delivered' }).eq('id', orderId);
    if (!error) {
      fetchOrders();
      toast.success('Pesanan ditandai sebagai Terkirim');
    }
  };

  const handleRateOrder = (orderId: number, rating: number) => {
    setRatedOrders(prev => ({ ...prev, [orderId]: rating }));
    toast.success('Terima kasih!', { description: `Ulasan ${rating} bintang Anda telah disimpan.` });
  };

  if (!isLoaded || !user) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center">Memuat profil...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h2 className="text-3xl tracking-tight text-slate-900 mb-2">Profil Saya</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab('account')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'account' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-zinc-50'
            }`}
          >
            <User className="w-4 h-4" />
            Detail Akun
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'orders' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-zinc-50'
            }`}
          >
            <Package className="w-4 h-4" />
            Pesanan Saya
          </button>
          <div className="pt-4 mt-4 border-t border-zinc-200">
            <button 
              onClick={() => signOut({ redirectUrl: '/' })}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3 space-y-8">
          {activeTab === 'account' && (
            <Card className="p-8 border-zinc-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl text-slate-900">Informasi Pribadi & Alamat</h3>
                {!isEditing && (
                  <Button variant="outline" onClick={() => setIsEditing(true)} className="border-zinc-200 text-slate-900 hover:bg-zinc-50">
                    Edit Detail
                  </Button>
                )}
              </div>
              
              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Nama Depan</label>
                      <input required type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Nama Belakang</label>
                      <input required type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Email</label>
                      <input type="email" value={user.primaryEmailAddress?.emailAddress || ''} disabled className="w-full px-3 py-2 border border-zinc-200 rounded-md bg-zinc-50 text-slate-500" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Nomor Telepon</label>
                      <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-slate-700">Alamat Lengkap</label>
                      <textarea rows={3} value={address} onChange={e => setAddress(e.target.value)} className="w-full px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={isSaving} className="bg-slate-900 text-white">
                      {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="border-zinc-200">
                      Batal
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Nama Lengkap</p>
                    <p className="font-medium text-slate-900">{firstName} {lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Alamat Email</p>
                    <p className="font-medium text-slate-900">{user.primaryEmailAddress?.emailAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Nomor Telepon</p>
                    <p className="font-medium text-slate-900">{phone || '-'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm text-slate-500 mb-1">Alamat Lengkap</p>
                    <p className="font-medium text-slate-900">{address || 'Belum ada alamat'}</p>
                  </div>
                </div>
              )}
            </Card>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Pesanan Saya</h3>
                <Link href="/orders" className="text-xs font-bold text-zinc-400 hover:text-black transition-colors uppercase tracking-widest">
                  Lihat Semua
                </Link>
              </div>
              
              <div className="space-y-6">
                {orders.map((order) => {
                  const generateOrderCode = (id: string) => {
                    let hash = 0;
                    for (let i = 0; i < id.length; i++) {
                      hash = (hash << 5) - hash + id.charCodeAt(i);
                      hash |= 0;
                    }
                    const absHash = Math.abs(hash);
                    return `#LUMINA-${(absHash % 9000) + 1000}`;
                  };

                  const isAdmin = (user?.publicMetadata?.role as string)?.toLowerCase() === "admin" || 
                                  (user?.unsafeMetadata?.role as string)?.toLowerCase() === "admin";

                  const getStatusStyle = (status: string) => {
                    switch (status.toLowerCase()) {
                      case "completed":
                      case "selesai":
                      case "paid":
                        return "bg-green-50 text-green-600 border-green-100";
                      case "shipped":
                      case "dikirim":
                        return "bg-blue-50 text-blue-600 border-blue-100";
                      case "pending":
                      case "menunggu":
                        return "bg-amber-50 text-amber-600 border-amber-100";
                      default:
                        return "bg-zinc-50 text-zinc-600 border-zinc-100";
                    }
                  };

                  return (
                    <div key={order.id} className="bg-white border border-zinc-100 rounded-[24px] overflow-hidden hover:shadow-xl hover:border-zinc-200 transition-all duration-300">
                      <div className="px-6 py-4 bg-zinc-50/50 border-b border-zinc-100 flex flex-wrap justify-between items-center gap-4">
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                            {generateOrderCode(order.id)} • {new Date(order.created_at).toLocaleDateString('id-ID')}
                          </p>
                          <h4 className="font-bold text-slate-900">
                            Pesanan {order.items?.[0]?.name || "Produk Lumina"}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-100 p-2 flex-shrink-0">
                            <img 
                              src={order.items?.[0]?.image || order.items?.[0]?.images?.[0] || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80'} 
                              alt={order.items?.[0]?.name || "Produk"} 
                              className="w-full h-full object-contain" 
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{order.items?.[0]?.name}</p>
                            <p className="text-[10px] font-bold text-zinc-400 mt-0.5">
                              {order.items?.length || 0} Barang • Total: <span className="text-slate-900">{formatIDR(order.total_amount)}</span>
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Link href={`/orders/${order.id}`}>
                              <Button size="sm" variant="outline" className="text-[10px] font-black uppercase tracking-widest rounded-full h-8 px-4 border-zinc-200">
                                Detail
                              </Button>
                            </Link>
                            {isAdmin && order.status.toLowerCase() === 'pending' && (
                              <Button 
                                size="sm" 
                                className="text-[10px] font-black uppercase tracking-widest rounded-full h-8 px-4 bg-blue-600 hover:bg-blue-700"
                                onClick={() => handleMarkDelivered(order.id)}
                              >
                                Kirim
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {orders.length === 0 && (
                  <div className="text-center py-16 bg-zinc-50 rounded-[32px] border border-dashed border-zinc-200">
                    <Package className="w-10 h-10 text-zinc-300 mx-auto mb-4" />
                    <p className="text-zinc-500 font-medium">Anda belum pernah melakukan pemesanan.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
