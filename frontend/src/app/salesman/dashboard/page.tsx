'use client';
import { useQuery } from '@tanstack/react-query';
import ProtectedRoute from '@/components/protected_route';
import MainLayout from '@/components/main_layout';
import api from '@/services/api';
import { useAuthStore } from '@/store/auth_store';
import { ShoppingCart, TrendingUp, Clock } from 'lucide-react';
import StatCard from '@/components/stat_card';

const fetch_orders = () => api.get('/api/v1/orders/?limit=100').then(r => r.data.data);

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const STATUS_COLORS: Record<string, string> = {
  pending: '#ff8f00', confirmed: '#1565c0', delivered: '#2e7d32',
  cancelled: '#c62828', in_transit: '#6a1b9a',
};

export default function SalesmanDashboardPage() {
  const { user } = useAuthStore();
  const { data: all_orders = [], isLoading } = useQuery({ queryKey: ['orders'], queryFn: fetch_orders });

  const today = new Date().toISOString().slice(0, 10);
  const month_start = `${new Date().toISOString().slice(0, 7)}-01`;

  const my_orders       = all_orders.filter((o: any) => o.salesman_id === user?.id);
  const today_orders    = my_orders.filter((o: any) => o.created_at?.startsWith(today));
  const month_orders    = my_orders.filter((o: any) => o.created_at >= month_start);
  const pending_orders  = my_orders.filter((o: any) => o.status === 'pending');

  const recent = [...my_orders]
    .sort((a: any, b: any) => b.created_at.localeCompare(a.created_at))
    .slice(0, 10);

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-8">
          <div>
            <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--coffee-dark)' }}>
              Halo, {user?.username} 👋
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--coffee-light)' }}>
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <StatCard label="Order Hari Ini"  value={today_orders.length}  icon={<ShoppingCart size={20} />} />
            <StatCard label="Order Bulan Ini" value={month_orders.length}  icon={<TrendingUp size={20} />} accent />
            <StatCard label="Menunggu Konfirmasi" value={pending_orders.length} icon={<Clock size={20} />} danger={pending_orders.length > 0} />
          </div>

          <section>
            <h2 className="font-display text-lg font-semibold mb-3" style={{ color: 'var(--coffee-dark)' }}>
              Order Terbaru
            </h2>
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--cream-border)' }}>
              <table className="w-full text-sm">
                <thead style={{ backgroundColor: 'var(--cream-card)' }}>
                  <tr>
                    {['Kode', 'Total', 'Status', 'Waktu'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-semibold"
                        style={{ color: 'var(--coffee-light)', borderBottom: '1px solid var(--cream-border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: 'var(--cream-card)' }}>
                  {isLoading
                    ? <tr><td colSpan={4} className="px-4 py-8 text-center" style={{ color: 'var(--coffee-light)' }}>Loading...</td></tr>
                    : recent.length === 0
                    ? <tr><td colSpan={4} className="px-4 py-8 text-center" style={{ color: 'var(--coffee-light)' }}>Belum ada order</td></tr>
                    : recent.map((o: any) => (
                      <tr key={o.id} className="border-t" style={{ borderColor: 'var(--cream-border)' }}>
                        <td className="px-4 py-3 font-mono font-medium" style={{ color: 'var(--coffee-mid)' }}>{o.order_code}</td>
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
          </section>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
