'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ProtectedRoute from '@/components/protected_route';
import MainLayout from '@/components/main_layout';
import api from '@/services/api';
import { useAuthStore } from '@/store/auth_store';
import { MapPin, Plus, X, Check, Loader2 } from 'lucide-react';

interface Customer { id: number; name: string; address: string; }
interface Product  { id: number; name: string; price: number; stock_available: number; }

const fetch_customers = () => api.get('/api/v1/customers/?limit=100').then(r => r.data.data);
const fetch_products  = () => api.get('/api/v1/products/?limit=100').then(r => r.data.data);

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function SalesmanOrderPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: fetch_customers });
  const { data: products  = [] } = useQuery({ queryKey: ['products'],  queryFn: fetch_products });

  const [customer_id, set_customer_id] = useState('');
  const [items, set_items]             = useState([{ product_id: '', quantity: '' }]);
  const [gps, set_gps]                 = useState<{ lat: number; lng: number } | null>(null);
  const [gps_loading, set_gps_loading] = useState(false);
  const [gps_error, set_gps_error]     = useState('');
  const [error, set_error]             = useState('');
  const [success, set_success]         = useState('');

  const get_gps = () => {
    set_gps_loading(true);
    set_gps_error('');
    navigator.geolocation.getCurrentPosition(
      (pos) => { set_gps({ lat: pos.coords.latitude, lng: pos.coords.longitude }); set_gps_loading(false); },
      ()    => { set_gps_error('GPS tidak bisa diakses'); set_gps_loading(false); }
    );
  };

  const create_mut = useMutation({
    mutationFn: (d: any) => api.post('/api/v1/orders', d),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      set_success(`Order ${res.data.data.order_code} berhasil dibuat!`);
      set_customer_id('');
      set_items([{ product_id: '', quantity: '' }]);
      set_gps(null);
      set_error('');
    },
    onError: (e: any) => set_error(e.response?.data?.message ?? 'Gagal membuat order'),
  });

  const add_item    = () => set_items(p => [...p, { product_id: '', quantity: '' }]);
  const remove_item = (i: number) => set_items(p => p.filter((_, idx) => idx !== i));
  const update_item = (i: number, key: string, val: string) =>
    set_items(p => p.map((item, idx) => idx === i ? { ...item, [key]: val } : item));

  const subtotal = items.reduce((acc, item) => {
    const p = products.find((x: Product) => x.id === Number(item.product_id));
    return acc + (p ? p.price * Number(item.quantity || 0) : 0);
  }, 0);

  const handle_submit = () => {
    set_error(''); set_success('');
    if (!gps) { set_error('GPS wajib diambil terlebih dahulu'); return; }
    create_mut.mutate({
      customer_id: Number(customer_id),
      salesman_id: user?.id,
      latitude: gps.lat,
      longitude: gps.lng,
      items: items.map(i => ({ product_id: Number(i.product_id), quantity: Number(i.quantity) })),
    });
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="max-w-lg space-y-6">
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--coffee-dark)' }}>Buat Order</h1>

          {success && (
            <div className="px-4 py-3 rounded-lg text-sm font-medium" style={{ backgroundColor: '#e8f5e9', color: 'var(--green-ok)' }}>
              ✓ {success}
            </div>
          )}

          <div className="rounded-xl border p-5 space-y-4" style={{ borderColor: 'var(--cream-border)', backgroundColor: 'var(--cream-card)' }}>
            {/* Customer */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--coffee-light)' }}>Customer</label>
              <select value={customer_id} onChange={e => set_customer_id(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
                style={{ backgroundColor: 'var(--cream-bg)', borderColor: 'var(--cream-border)', color: 'var(--coffee-dark)' }}>
                <option value="">Pilih Customer</option>
                {customers.map((c: Customer) => <option key={c.id} value={c.id}>{c.name} — {c.address}</option>)}
              </select>
            </div>

            {/* GPS */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--coffee-light)' }}>Lokasi GPS</label>
              <button onClick={get_gps} disabled={gps_loading}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border hover:opacity-80 disabled:opacity-50"
                style={{ borderColor: 'var(--cream-border)', color: 'var(--coffee-mid)' }}>
                {gps_loading ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                {gps ? `${gps.lat.toFixed(6)}, ${gps.lng.toFixed(6)}` : 'Ambil Lokasi'}
              </button>
              {gps_error && <p className="text-xs mt-1" style={{ color: 'var(--red-danger)' }}>{gps_error}</p>}
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium" style={{ color: 'var(--coffee-light)' }}>Produk</label>
                <button onClick={add_item} className="text-xs px-2 py-1 rounded"
                  style={{ backgroundColor: 'var(--cream-border)', color: 'var(--coffee-dark)' }}>+ Item</button>
              </div>
              {items.map((item, i) => {
                const prod = products.find((p: Product) => p.id === Number(item.product_id));
                return (
                  <div key={i} className="mb-2">
                    <div className="flex gap-2">
                      <select value={item.product_id} onChange={e => update_item(i, 'product_id', e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg text-sm outline-none border"
                        style={{ backgroundColor: 'var(--cream-bg)', borderColor: 'var(--cream-border)', color: 'var(--coffee-dark)' }}>
                        <option value="">Pilih Produk</option>
                        {products.map((p: Product) => (
                          <option key={p.id} value={p.id}>{p.name} — {fmt(p.price)} (stok: {p.stock_available})</option>
                        ))}
                      </select>
                      <input value={item.quantity} onChange={e => update_item(i, 'quantity', e.target.value)}
                        placeholder="Qty" className="w-20 px-3 py-2 rounded-lg text-sm outline-none border"
                        style={{ backgroundColor: 'var(--cream-bg)', borderColor: 'var(--cream-border)', color: 'var(--coffee-dark)' }} />
                      {items.length > 1 && (
                        <button onClick={() => remove_item(i)} style={{ color: 'var(--red-danger)' }}><X size={14} /></button>
                      )}
                    </div>
                    {prod && item.quantity && (
                      <p className="text-xs mt-1 ml-1" style={{ color: 'var(--coffee-light)' }}>
                        Subtotal: {fmt(prod.price * Number(item.quantity))}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Total */}
            {subtotal > 0 && (
              <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: 'var(--cream-border)' }}>
                <span className="text-sm font-semibold" style={{ color: 'var(--coffee-light)' }}>Total</span>
                <span className="font-display text-lg font-bold" style={{ color: 'var(--coffee-dark)' }}>{fmt(subtotal)}</span>
              </div>
            )}

            {error && <p className="text-sm" style={{ color: 'var(--red-danger)' }}>{error}</p>}

            <button onClick={handle_submit} disabled={create_mut.isPending}
              className="w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: 'var(--coffee-mid)', color: 'var(--cream-bg)' }}>
              {create_mut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {create_mut.isPending ? 'Memproses...' : 'Buat Order'}
            </button>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
