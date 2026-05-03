'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ProtectedRoute from '@/components/protected_route';
import MainLayout from '@/components/main_layout';
import api from '@/services/api';
import { useAuthStore } from '@/store/auth_store';

const fetch_orders    = () => api.get('/api/v1/orders/?limit=200').then(r => r.data.data);
const fetch_customers = () => api.get('/api/v1/customers/?limit=100').then(r => r.data.data);

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const STATUS_COLORS: Record<string, string> = {
  pending: '#ff8f00', confirmed: '#1565c0', delivered: '#2e7d32',
  cancelled: '#c62828', in_transit: '#6a1b9a',
};

const STATUS_LIST = ['semua', 'pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'];

export default function SalesmanHistoryPage() {
  const { user } = useAuthStore();
  const { data: all_orders = [], isLoading } = useQuery({ queryKey: ['orders'],    queryFn: fetch_orders });
  const { data: customers  = [] }            = useQuery({ queryKey: ['customers'], queryFn: fetch_customers });

  const [filter, set_filter] = useState('semua');

  const my_orders = all_orders
    .filter((o: any) => o.salesman_id === user?.id)
    .filter((o: any) => filter === 'semua' || o.status === filter)
    .sort((a: any, b: any) => b.created_at.localeCompare(a.created_at));

  const customer_name = (id: number) => customers.find((c: any) => c.id === id)?.name ?? id;

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--coffee-dark)' }}>Riwayat Order</h1>

          {/* Filter */}
          <div className="flex gap-2 flex-wrap">
            {STATUS_LIST.map(s => (
              <button key={s} onClick={() => set_filter(s)}
                className="px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors"
                style={{
                  backgroundColor: filter === s ? 'var(--coffee-mid)' : 'var(--cream-card)',
                  color: filter === s ? 'var(--cream-bg)' : 'var(--coffee-light)',
                  border: `1px solid ${filter === s ? 'var(--coffee-mid)' : 'var(--cream-border)'}`,
                }}>
                {s}
              </button>
            ))}
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--cream-border)' }}>
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: 'var(--cream-card)' }}>
                <tr>
                  {['Kode', 'Customer', 'Total', 'Status', 'Waktu'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold"
                      style={{ color: 'var(--coffee-light)', borderBottom: '1px solid var(--cream-border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'var(--cream-card)' }}>
                {isLoading
                  ? <tr><td colSpan={5} className="px-4 py-8 text-center" style={{ color: 'var(--coffee-light)' }}>Loading...</td></tr>
                  : my_orders.length === 0
                  ? <tr><td colSpan={5} className="px-4 py-8 text-center" style={{ color: 'var(--coffee-light)' }}>Tidak ada order</td></tr>
                  : my_orders.map((o: any) => (
                    <tr key={o.id} className="border-t" style={{ borderColor: 'var(--cream-border)' }}>
                      <td className="px-4 py-3 font-mono font-medium" style={{ color: 'var(--coffee-mid)' }}>{o.order_code}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--coffee-dark)' }}>{customer_name(o.customer_id)}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--coffee-dark)' }}>{fmt(o.total_amount ?? 0)}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: STATUS_COLORS[o.status] ?? '#888' }}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--coffee-light)' }}>
                        {o.created_at ? new Date(o.created_at).toLocaleString('id-ID') : '-'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
