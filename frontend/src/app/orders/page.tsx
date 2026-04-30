'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ProtectedRoute from '@/components/protected_route';
import MainLayout from '@/components/main_layout';
import api from '@/services/api';
import { Plus, Eye, X, Check, ChevronDown } from 'lucide-react';

interface Order { id: number; order_code: string; customer_id: number; salesman_id: number; status: string; total_amount: number; created_at: string; items?: any[]; }
interface Customer { id: number; name: string; }
interface Salesman { id: number; full_name: string; }
interface Product { id: number; name: string; price: number; }

const fetch_orders    = () => api.get('/api/v1/orders?limit=100').then(r => r.data.data);
const fetch_customers = () => api.get('/api/v1/customers?limit=100').then(r => r.data.data);
const fetch_salesmen  = () => api.get('/api/v1/salesmen?limit=100').then(r => r.data.data);
const fetch_products  = () => api.get('/api/v1/products?limit=100').then(r => r.data.data);
const fetch_order     = (id: number) => api.get(`/api/v1/orders/${id}`).then(r => r.data.data);

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const STATUS_COLORS: Record<string, string> = {
  pending: '#ff8f00', confirmed: '#1565c0', cancelled: '#c62828', delivered: '#2e7d32', in_transit: '#6a1b9a',
};

const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['cancelled'],
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: STATUS_COLORS[status] ?? '#888' }}>
      {status}
    </span>
  );
}

export default function OrdersPage() {
  const qc = useQueryClient();
  const { data: orders    = [], isLoading } = useQuery({ queryKey: ['orders'],    queryFn: fetch_orders });
  const { data: customers = [] }            = useQuery({ queryKey: ['customers'], queryFn: fetch_customers });
  const { data: salesmen  = [] }            = useQuery({ queryKey: ['salesmen'],  queryFn: fetch_salesmen });
  const { data: products  = [] }            = useQuery({ queryKey: ['products'],  queryFn: fetch_products });

  const [create_modal, set_create_modal] = useState(false);
  const [detail_id, set_detail_id]       = useState<number | null>(null);
  const [error, set_error]               = useState('');

  // Create order form
  const [form, set_form] = useState({ customer_id: '', salesman_id: '', latitude: '', longitude: '' });
  const [items, set_items] = useState([{ product_id: '', quantity: '' }]);

  const { data: detail_order } = useQuery({
    queryKey: ['order', detail_id],
    queryFn: () => fetch_order(detail_id!),
    enabled: !!detail_id,
  });

  const create_mut = useMutation({
    mutationFn: (d: any) => api.post('/api/v1/orders', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders'] }); close_create(); },
    onError: (e: any) => set_error(e.response?.data?.message ?? 'Gagal'),
  });

  const update_status_mut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/api/v1/orders/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['order', detail_id] });
    },
  });

  const close_create = () => { set_create_modal(false); set_error(''); set_form({ customer_id: '', salesman_id: '', latitude: '', longitude: '' }); set_items([{ product_id: '', quantity: '' }]); };

  const add_item    = () => set_items(p => [...p, { product_id: '', quantity: '' }]);
  const remove_item = (i: number) => set_items(p => p.filter((_, idx) => idx !== i));
  const update_item = (i: number, key: string, val: string) => set_items(p => p.map((item, idx) => idx === i ? { ...item, [key]: val } : item));

  const handle_create = () => {
    set_error('');
    const payload = {
      customer_id: Number(form.customer_id),
      salesman_id: Number(form.salesman_id),
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      items: items.map(i => ({ product_id: Number(i.product_id), quantity: Number(i.quantity) })),
    };
    create_mut.mutate(payload);
  };

  const name_of = (arr: any[], id: number, key: string) => arr.find(x => x.id === id)?.[key] ?? id;

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--coffee-dark)' }}>Orders</h1>
            <button onClick={() => set_create_modal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
              style={{ backgroundColor: 'var(--coffee-mid)', color: 'var(--cream-bg)' }}>
              <Plus size={16} /> Buat Order
            </button>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--cream-border)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ backgroundColor: 'var(--cream-card)' }}>
                  <tr>
                    {['Kode', 'Customer', 'Salesman', 'Total', 'Status', 'Waktu', 'Aksi'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-semibold"
                        style={{ color: 'var(--coffee-light)', borderBottom: '1px solid var(--cream-border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: 'var(--cream-card)' }}>
                  {isLoading
                    ? <tr><td colSpan={7} className="px-4 py-8 text-center" style={{ color: 'var(--coffee-light)' }}>Loading...</td></tr>
                    : orders.map((o: Order) => (
                      <tr key={o.id} className="border-t" style={{ borderColor: 'var(--cream-border)' }}>
                        <td className="px-4 py-3 font-mono font-medium" style={{ color: 'var(--coffee-mid)' }}>{o.order_code}</td>
                        <td className="px-4 py-3" style={{ color: 'var(--coffee-dark)' }}>{name_of(customers, o.customer_id, 'name')}</td>
                        <td className="px-4 py-3" style={{ color: 'var(--coffee-dark)' }}>{name_of(salesmen, o.salesman_id, 'full_name')}</td>
                        <td className="px-4 py-3 font-medium" style={{ color: 'var(--coffee-dark)' }}>{fmt(o.total_amount ?? 0)}</td>
                        <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--coffee-light)' }}>
                          {o.created_at ? new Date(o.created_at).toLocaleString('id-ID') : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => set_detail_id(o.id)} className="p-1.5 rounded hover:opacity-70"
                            style={{ color: 'var(--coffee-mid)' }}><Eye size={14} /></button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Create Modal */}
        {create_modal && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
            <div className="w-full max-w-lg rounded-2xl p-6 shadow-xl overflow-y-auto" style={{ maxHeight: '90vh', backgroundColor: 'var(--cream-card)' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-lg font-bold" style={{ color: 'var(--coffee-dark)' }}>Buat Order</h2>
                <button onClick={close_create} style={{ color: 'var(--coffee-light)' }}><X size={18} /></button>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Customer', key: 'customer_id', options: customers, opt_label: 'name' },
                  { label: 'Salesman', key: 'salesman_id', options: salesmen, opt_label: 'full_name' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--coffee-light)' }}>{f.label}</label>
                    <select value={(form as any)[f.key]} onChange={e => set_form(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
                      style={{ backgroundColor: 'var(--cream-bg)', borderColor: 'var(--cream-border)', color: 'var(--coffee-dark)' }}>
                      <option value="">Pilih {f.label}</option>
                      {f.options.map((o: any) => <option key={o.id} value={o.id}>{o[f.opt_label]}</option>)}
                    </select>
                  </div>
                ))}
                {[{ label: 'Latitude', key: 'latitude' }, { label: 'Longitude', key: 'longitude' }].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--coffee-light)' }}>{f.label}</label>
                    <input value={(form as any)[f.key]} onChange={e => set_form(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
                      style={{ backgroundColor: 'var(--cream-bg)', borderColor: 'var(--cream-border)', color: 'var(--coffee-dark)' }} />
                  </div>
                ))}

                {/* Items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium" style={{ color: 'var(--coffee-light)' }}>Items</label>
                    <button onClick={add_item} className="text-xs px-2 py-1 rounded"
                      style={{ backgroundColor: 'var(--cream-border)', color: 'var(--coffee-dark)' }}>+ Tambah Item</button>
                  </div>
                  {items.map((item, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <select value={item.product_id} onChange={e => update_item(i, 'product_id', e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg text-sm outline-none border"
                        style={{ backgroundColor: 'var(--cream-bg)', borderColor: 'var(--cream-border)', color: 'var(--coffee-dark)' }}>
                        <option value="">Produk</option>
                        {products.map((p: Product) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <input value={item.quantity} onChange={e => update_item(i, 'quantity', e.target.value)}
                        placeholder="Qty" className="w-20 px-3 py-2 rounded-lg text-sm outline-none border"
                        style={{ backgroundColor: 'var(--cream-bg)', borderColor: 'var(--cream-border)', color: 'var(--coffee-dark)' }} />
                      {items.length > 1 && (
                        <button onClick={() => remove_item(i)} className="px-2" style={{ color: 'var(--red-danger)' }}>
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {error && <p className="text-sm" style={{ color: 'var(--red-danger)' }}>{error}</p>}
                <div className="flex gap-2 pt-2">
                  <button onClick={close_create} className="flex-1 py-2 rounded-lg text-sm border"
                    style={{ borderColor: 'var(--cream-border)', color: 'var(--coffee-light)' }}>Batal</button>
                  <button onClick={handle_create} disabled={create_mut.isPending}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60"
                    style={{ backgroundColor: 'var(--coffee-mid)', color: 'var(--cream-bg)' }}>
                    <Check size={14} />{create_mut.isPending ? 'Menyimpan...' : 'Buat Order'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {detail_id && detail_order && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
            <div className="w-full max-w-lg rounded-2xl p-6 shadow-xl overflow-y-auto" style={{ maxHeight: '90vh', backgroundColor: 'var(--cream-card)' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-lg font-bold" style={{ color: 'var(--coffee-dark)' }}>
                  {detail_order.order_code}
                </h2>
                <button onClick={() => set_detail_id(null)} style={{ color: 'var(--coffee-light)' }}><X size={18} /></button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <StatusBadge status={detail_order.status} />
                  <span className="text-sm" style={{ color: 'var(--coffee-light)' }}>
                    {new Date(detail_order.created_at).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span style={{ color: 'var(--coffee-light)' }}>Customer</span><p className="font-medium" style={{ color: 'var(--coffee-dark)' }}>{name_of(customers, detail_order.customer_id, 'name')}</p></div>
                  <div><span style={{ color: 'var(--coffee-light)' }}>Salesman</span><p className="font-medium" style={{ color: 'var(--coffee-dark)' }}>{name_of(salesmen, detail_order.salesman_id, 'full_name')}</p></div>
                  <div><span style={{ color: 'var(--coffee-light)' }}>Total</span><p className="font-bold" style={{ color: 'var(--coffee-dark)' }}>{fmt(detail_order.total_amount ?? 0)}</p></div>
                </div>

                {/* Items */}
                {detail_order.items?.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2" style={{ color: 'var(--coffee-light)' }}>Items</p>
                    <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--cream-border)' }}>
                      {detail_order.items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between px-3 py-2 border-b last:border-0 text-sm"
                          style={{ borderColor: 'var(--cream-border)', backgroundColor: 'var(--cream-bg)' }}>
                          <span style={{ color: 'var(--coffee-dark)' }}>{name_of(products, item.product_id, 'name')}</span>
                          <span style={{ color: 'var(--coffee-light)' }}>x{item.quantity} — {fmt(item.subtotal ?? 0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status transition */}
                {STATUS_TRANSITIONS[detail_order.status] && (
                  <div>
                    <p className="text-sm font-semibold mb-2" style={{ color: 'var(--coffee-light)' }}>Update Status</p>
                    <div className="flex gap-2">
                      {STATUS_TRANSITIONS[detail_order.status].map((s: string) => (
                        <button key={s} onClick={() => update_status_mut.mutate({ id: detail_order.id, status: s })}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-80"
                          style={{ backgroundColor: STATUS_COLORS[s] }}>
                          → {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </MainLayout>
    </ProtectedRoute>
  );
}
