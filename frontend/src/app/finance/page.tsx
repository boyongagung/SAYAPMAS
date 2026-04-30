'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ProtectedRoute from '@/components/protected_route';
import MainLayout from '@/components/main_layout';
import api from '@/services/api';
import { Plus, X, Check } from 'lucide-react';

interface FinanceRecord { id: number; order_id: number; total_amount: number; paid_amount: number; remaining_amount: number; payment_status: string; }
interface Payment { id: number; finance_record_id: number; amount: number; created_at: string; }

const fetch_finance  = () => api.get('/api/v1/finance/records?limit=100').then(r => r.data.data);
const fetch_orders   = () => api.get('/api/v1/orders?limit=100').then(r => r.data.data);

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const PAYMENT_COLORS: Record<string, string> = {
  unpaid: '#c62828', partial: '#ff8f00', paid: '#2e7d32',
};

export default function FinancePage() {
  const qc = useQueryClient();
  const { data: records = [], isLoading } = useQuery({ queryKey: ['finance'],  queryFn: fetch_finance });
  const { data: orders  = [] }            = useQuery({ queryKey: ['orders'],   queryFn: fetch_orders });

  const [modal, set_modal]         = useState(false);
  const [selected_id, set_selected] = useState<number | null>(null);
  const [amount, set_amount]       = useState('');
  const [error, set_error]         = useState('');

  const pay_mut = useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) =>
      api.post(`/api/v1/finance/records/${id}/payments`, { amount }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['finance'] }); close_modal(); },
    onError: (e: any) => set_error(e.response?.data?.message ?? 'Gagal'),
  });

  const close_modal = () => { set_modal(false); set_selected(null); set_amount(''); set_error(''); };
  const open_pay = (id: number) => { set_selected(id); set_error(''); set_modal(true); };
  const handle_pay = () => { if (selected_id) pay_mut.mutate({ id: selected_id, amount: Number(amount) }); };

  const order_code = (id: number) => orders.find((o: any) => o.id === id)?.order_code ?? id;

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--coffee-dark)' }}>Finance</h1>

          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--cream-border)' }}>
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: 'var(--cream-card)' }}>
                <tr>
                  {['Order', 'Total', 'Dibayar', 'Sisa', 'Status', 'Aksi'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold"
                      style={{ color: 'var(--coffee-light)', borderBottom: '1px solid var(--cream-border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'var(--cream-card)' }}>
                {isLoading
                  ? <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: 'var(--coffee-light)' }}>Loading...</td></tr>
                  : records.map((r: FinanceRecord) => (
                    <tr key={r.id} className="border-t" style={{ borderColor: 'var(--cream-border)' }}>
                      <td className="px-4 py-3 font-mono font-medium" style={{ color: 'var(--coffee-mid)' }}>{order_code(r.order_id)}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--coffee-dark)' }}>{fmt(r.total_amount)}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--green-ok)' }}>{fmt(r.paid_amount)}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: r.remaining_amount > 0 ? 'var(--red-danger)' : 'var(--green-ok)' }}>
                        {fmt(r.remaining_amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: PAYMENT_COLORS[r.payment_status] ?? '#888' }}>
                          {r.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {r.payment_status !== 'paid' && (
                          <button onClick={() => open_pay(r.id)}
                            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold hover:opacity-80"
                            style={{ backgroundColor: 'var(--coffee-mid)', color: 'var(--cream-bg)' }}>
                            <Plus size={12} /> Bayar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {modal && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
            <div className="w-full max-w-sm rounded-2xl p-6 shadow-xl" style={{ backgroundColor: 'var(--cream-card)' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-lg font-bold" style={{ color: 'var(--coffee-dark)' }}>Tambah Pembayaran</h2>
                <button onClick={close_modal} style={{ color: 'var(--coffee-light)' }}><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--coffee-light)' }}>Jumlah Bayar</label>
                  <input type="number" value={amount} onChange={e => set_amount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
                    style={{ backgroundColor: 'var(--cream-bg)', borderColor: 'var(--cream-border)', color: 'var(--coffee-dark)' }}
                    placeholder="0" />
                </div>
                {error && <p className="text-sm" style={{ color: 'var(--red-danger)' }}>{error}</p>}
                <div className="flex gap-2">
                  <button onClick={close_modal} className="flex-1 py-2 rounded-lg text-sm border"
                    style={{ borderColor: 'var(--cream-border)', color: 'var(--coffee-light)' }}>Batal</button>
                  <button onClick={handle_pay} disabled={pay_mut.isPending}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60"
                    style={{ backgroundColor: 'var(--coffee-mid)', color: 'var(--cream-bg)' }}>
                    <Check size={14} />{pay_mut.isPending ? 'Memproses...' : 'Bayar'}
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
