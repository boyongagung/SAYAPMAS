'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import StatCard from '@/components/stat_card';
import { ShoppingCart, TrendingUp, AlertTriangle, Banknote, RefreshCw } from 'lucide-react';

const today_str = () => new Date().toISOString().slice(0, 10);
const month_start = () => `${new Date().toISOString().slice(0, 7)}-01`;

function fmt_currency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

function status_badge(status: string) {
  const map: Record<string, string> = {
    pending: '#ff8f00', confirmed: '#1565c0', delivered: '#2e7d32',
    cancelled: '#c62828', in_transit: '#6a1b9a',
  };
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: map[status] ?? '#888' }}>
      {status}
    </span>
  );
}

const fetch_orders   = () => api.get('/api/v1/orders/?limit=100').then(r => r.data.data);
const fetch_products = () => api.get('/api/v1/products/?limit=100').then(r => r.data.data);
const fetch_finance  = () => api.get('/api/v1/finance/records/?limit=500').then(r => r.data.data);
const fetch_salesmen = () => api.get('/api/v1/salesmen/?limit=100').then(r => r.data.data);

export default function DashboardPage() {
  const { data: orders   = [], isLoading: lo, refetch: ro } = useQuery({ queryKey: ['orders'],   queryFn: fetch_orders });
  const { data: products = [], isLoading: lp, refetch: rp } = useQuery({ queryKey: ['products'], queryFn: fetch_products });
  const { data: finance  = [], isLoading: lf, refetch: rf } = useQuery({ queryKey: ['finance'],  queryFn: fetch_finance });
  const { data: salesmen = [], isLoading: ls, refetch: rs } = useQuery({ queryKey: ['salesmen'], queryFn: fetch_salesmen });

  const loading = lo || lp || lf || ls;
  const refetch_all = () => { ro(); rp(); rf(); rs(); };

  const today    = today_str();
  const mo_start = month_start();
  const orders_today = orders.filter((o: any) => o.created_at?.startsWith(today));
  const orders_month = orders.filter((o: any) => o.created_at >= mo_start);
  const piutang      = finance.reduce((acc: number, r: any) => acc + (r.remaining_amount ?? 0), 0);
  const stok_kritis  = products.filter((p: any) => p.stock_available < 10);

  const max_count = Math.max(...salesmen.map((s: any) =>
    orders_today.filter((o: any) => o.salesman_id === s.id).length), 1);

  const salesman_counts = salesmen.map((s: any) => ({
    name: s.full_name,
    count: orders_today.filter((o: any) => o.salesman_id === s.id).length,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--coffee-dark)' }}>Dashboard</h1>
        <button onClick={refetch_all} disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border hover:opacity-70 disabled:opacity-40"
          style={{ borderColor: 'var(--cream-border)', color: 'var(--coffee-light)' }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Order Hari Ini"  value={orders_today.length}   icon={<ShoppingCart size={20} />} />
        <StatCard label="Order Bulan Ini" value={orders_month.length}   icon={<TrendingUp size={20} />} accent />
        <StatCard label="Total Piutang"   value={fmt_currency(piutang)} icon={<Banknote size={20} />} />
        <StatCard label="Stok Kritis"     value={stok_kritis.length}    icon={<AlertTriangle size={20} />} danger={stok_kritis.length > 0} />
      </div>

      {/* Stok + Salesman */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-lg font-semibold mb-3" style={{ color: 'var(--coffee-dark)' }}>Stok Overview</h2>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--cream-border)' }}>
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: 'var(--cream-card)' }}>
                <tr>
                  {['Produk', 'Avail', 'Booked', 'Transit', 'Deliv'].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 font-semibold"
                      style={{ color: 'var(--coffee-light)', borderBottom: '1px solid var(--cream-border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'var(--cream-card)' }}>
                {products.map((p: any) => {
                  const kritis = p.stock_available < 10;
                  return (
                    <tr key={p.id} className="border-t" style={{ borderColor: 'var(--cream-border)' }}>
                      <td className="px-3 py-2.5 font-medium" style={{ color: kritis ? 'var(--red-danger)' : 'var(--coffee-dark)' }}>{p.name}</td>
                      <td className="px-3 py-2.5 font-semibold" style={{ color: kritis ? 'var(--red-danger)' : 'var(--green-ok)' }}>{p.stock_available}</td>
                      <td className="px-3 py-2.5" style={{ color: 'var(--coffee-dark)' }}>{p.stock_booked}</td>
                      <td className="px-3 py-2.5" style={{ color: 'var(--coffee-dark)' }}>{p.stock_in_transit}</td>
                      <td className="px-3 py-2.5" style={{ color: 'var(--coffee-dark)' }}>{p.stock_delivered}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold mb-3" style={{ color: 'var(--coffee-dark)' }}>
            Performa Salesman (Hari Ini)
          </h2>
          <div className="rounded-xl border" style={{ borderColor: 'var(--cream-border)', backgroundColor: 'var(--cream-card)' }}>
            {salesman_counts.map((s: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 border-b last:border-0"
                style={{ borderColor: 'var(--cream-border)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--coffee-dark)' }}>{s.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--cream-border)' }}>
                    <div className="h-full rounded-full"
                      style={{ width: `${Math.min((s.count / max_count) * 100, 100)}%`, backgroundColor: 'var(--amber-accent)' }} />
                  </div>
                  <span className="text-sm font-bold w-6 text-right" style={{ color: 'var(--coffee-mid)' }}>{s.count}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
