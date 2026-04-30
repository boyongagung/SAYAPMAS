'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ProtectedRoute from '@/components/protected_route';
import MainLayout from '@/components/main_layout';
import api from '@/services/api';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';

interface Product { id: number; name: string; price: number; stock_available: number; stock_booked: number; stock_in_transit: number; stock_delivered: number; }

const fetch_products = () => api.get('/api/v1/products?limit=100').then(r => r.data.data);
const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
const EMPTY = { name: '', price: '', stock_available: '' };

export default function ProductsPage() {
  const qc = useQueryClient();
  const { data: products = [], isLoading } = useQuery({ queryKey: ['products'], queryFn: fetch_products });

  const [modal, set_modal] = useState(false);
  const [edit_data, set_edit_data] = useState<Product | null>(null);
  const [form, set_form] = useState<typeof EMPTY>({ ...EMPTY });
  const [error, set_error] = useState('');

  const create_mut = useMutation({
    mutationFn: (d: any) => api.post('/api/v1/products', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); close_modal(); },
    onError: (e: any) => set_error(e.response?.data?.message ?? 'Gagal'),
  });

  const update_mut = useMutation({
    mutationFn: (d: any) => api.put(`/api/v1/products/${edit_data?.id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); close_modal(); },
    onError: (e: any) => set_error(e.response?.data?.message ?? 'Gagal'),
  });

  const delete_mut = useMutation({
    mutationFn: (id: number) => api.delete(`/api/v1/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });

  const open_create = () => { set_edit_data(null); set_form({ ...EMPTY }); set_error(''); set_modal(true); };
  const open_edit = (p: Product) => {
    set_edit_data(p);
    set_form({ name: p.name, price: String(p.price), stock_available: String(p.stock_available) });
    set_error(''); set_modal(true);
  };
  const close_modal = () => { set_modal(false); set_edit_data(null); set_error(''); };
  const handle_submit = () => {
    const payload = { ...form, price: Number(form.price), stock_available: Number(form.stock_available) };
    edit_data ? update_mut.mutate(payload) : create_mut.mutate(payload);
  };
  const is_loading_mut = create_mut.isPending || update_mut.isPending;

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--coffee-dark)' }}>Products</h1>
            <button onClick={open_create}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
              style={{ backgroundColor: 'var(--coffee-mid)', color: 'var(--cream-bg)' }}>
              <Plus size={16} /> Tambah Produk
            </button>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--cream-border)' }}>
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: 'var(--cream-card)' }}>
                <tr>
                  {['Produk', 'Harga', 'Available', 'Booked', 'Transit', 'Delivered', 'Aksi'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold"
                      style={{ color: 'var(--coffee-light)', borderBottom: '1px solid var(--cream-border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'var(--cream-card)' }}>
                {isLoading
                  ? <tr><td colSpan={7} className="px-4 py-8 text-center" style={{ color: 'var(--coffee-light)' }}>Loading...</td></tr>
                  : products.map((p: Product) => {
                    const kritis = p.stock_available < 10;
                    return (
                      <tr key={p.id} className="border-t" style={{ borderColor: 'var(--cream-border)' }}>
                        <td className="px-4 py-3 font-medium" style={{ color: 'var(--coffee-dark)' }}>{p.name}</td>
                        <td className="px-4 py-3" style={{ color: 'var(--coffee-dark)' }}>{fmt(p.price)}</td>
                        <td className="px-4 py-3 font-semibold" style={{ color: kritis ? 'var(--red-danger)' : 'var(--green-ok)' }}>{p.stock_available}</td>
                        <td className="px-4 py-3" style={{ color: 'var(--coffee-dark)' }}>{p.stock_booked}</td>
                        <td className="px-4 py-3" style={{ color: 'var(--coffee-dark)' }}>{p.stock_in_transit}</td>
                        <td className="px-4 py-3" style={{ color: 'var(--coffee-dark)' }}>{p.stock_delivered}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => open_edit(p)} className="p-1.5 rounded hover:opacity-70"
                              style={{ color: 'var(--coffee-mid)' }}><Pencil size={14} /></button>
                            <button onClick={() => delete_mut.mutate(p.id)} className="p-1.5 rounded hover:opacity-70"
                              style={{ color: 'var(--red-danger)' }}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {modal && (
          <div className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
            <div className="w-full max-w-md rounded-2xl p-6 shadow-xl"
              style={{ backgroundColor: 'var(--cream-card)' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-lg font-bold" style={{ color: 'var(--coffee-dark)' }}>
                  {edit_data ? 'Edit Produk' : 'Tambah Produk'}
                </h2>
                <button onClick={close_modal} style={{ color: 'var(--coffee-light)' }}><X size={18} /></button>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Nama Produk', key: 'name' },
                  { label: 'Harga', key: 'price' },
                  { label: 'Stok Available', key: 'stock_available' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--coffee-light)' }}>{f.label}</label>
                    <input value={(form as any)[f.key]} onChange={e => set_form(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
                      style={{ backgroundColor: 'var(--cream-bg)', borderColor: 'var(--cream-border)', color: 'var(--coffee-dark)' }} />
                  </div>
                ))}
                {error && <p className="text-sm" style={{ color: 'var(--red-danger)' }}>{error}</p>}
                <div className="flex gap-2 pt-2">
                  <button onClick={close_modal} className="flex-1 py-2 rounded-lg text-sm border"
                    style={{ borderColor: 'var(--cream-border)', color: 'var(--coffee-light)' }}>Batal</button>
                  <button onClick={handle_submit} disabled={is_loading_mut}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60"
                    style={{ backgroundColor: 'var(--coffee-mid)', color: 'var(--cream-bg)' }}>
                    <Check size={14} />{is_loading_mut ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </MainLayout>
    </ProtectedRoute>
  );
}
