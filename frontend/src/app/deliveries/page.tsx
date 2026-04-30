'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ProtectedRoute from '@/components/protected_route';
import MainLayout from '@/components/main_layout';
import api from '@/services/api';
import { Eye, X } from 'lucide-react';

interface Delivery { id: number; delivery_code: string; order_id: number; status: string; created_at: string; }

const fetch_deliveries = () => api.get('/api/v1/deliveries?limit=100').then(r => r.data.data);
const fetch_delivery   = (id: number) => api.get(`/api/v1/deliveries/${id}`).then(r => r.data.data);
const fetch_orders     = () => api.get('/api/v1/orders?limit=100').then(r => r.data.data);

const STATUS_COLORS: Record<string, string> = {
  pending: '#ff8f00', in_transit: '#6a1b9a', delivered: '#2e7d32', failed: '#c62828',
};

const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['in_transit'],
  in_transit: ['delivered', 'failed'],
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: STATUS_COLORS[status] ?? '#888' }}>
      {status}
    </span>
  );
}

export default function DeliveriesPage() {
  const qc = useQueryClient();
  const { data: deliveries = [], isLoading } = useQuery({ queryKey: ['deliveries'], queryFn: fetch_deliveries });
  const { data: orders = [] }                = useQuery({ queryKey: ['orders'],     queryFn: fetch_orders });

  const [detail_id, set_detail_id] = useState<number | null>(null);

  const { data: detail } = useQuery({
    queryKey: ['delivery', detail_id],
    queryFn: () => fetch_delivery(detail_id!),
    enabled: !!detail_id,
  });

  const update_status_mut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/api/v1/deliveries/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deliveries'] });
      qc.invalidateQueries({ queryKey: ['delivery', detail_id] });
    },
  });

  const order_code = (id: number) => orders.find((o: any) => o.id === id)?.order_code ?? id;

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--coffee-dark)' }}>Deliveries</h1>

          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--cream-border)' }}>
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: 'var(--cream-card)' }}>
                <tr>
                  {['Kode Delivery', 'Order', 'Status', 'Waktu', 'Aksi'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold"
                      style={{ color: 'var(--coffee-light)', borderBottom: '1px solid var(--cream-border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'var(--cream-card)' }}>
                {isLoading
                  ? <tr><td colSpan={5} className="px-4 py-8 text-center" style={{ color: 'var(--coffee-light)' }}>Loading...</td></tr>
                  : deliveries.map((d: Delivery) => (
                    <tr key={d.id} className="border-t" style={{ borderColor: 'var(--cream-border)' }}>
                      <td className="px-4 py-3 font-mono font-medium" style={{ color: 'var(--coffee-mid)' }}>{d.delivery_code}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--coffee-dark)' }}>{order_code(d.order_id)}</td>
                      <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--coffee-light)' }}>
                        {d.created_at ? new Date(d.created_at).toLocaleString('id-ID') : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => set_detail_id(d.id)} className="p-1.5 rounded hover:opacity-70"
                          style={{ color: 'var(--coffee-mid)' }}><Eye size={14} /></button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Modal */}
        {detail_id && detail && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
            <div className="w-full max-w-md rounded-2xl p-6 shadow-xl" style={{ backgroundColor: 'var(--cream-card)' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-lg font-bold" style={{ color: 'var(--coffee-dark)' }}>{detail.delivery_code}</h2>
                <button onClick={() => set_detail_id(null)} style={{ color: 'var(--coffee-light)' }}><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <StatusBadge status={detail.status} />
                  <span className="text-sm" style={{ color: 'var(--coffee-light)' }}>
                    {new Date(detail.created_at).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="text-sm">
                  <span style={{ color: 'var(--coffee-light)' }}>Order</span>
                  <p className="font-medium font-mono" style={{ color: 'var(--coffee-dark)' }}>{order_code(detail.order_id)}</p>
                </div>

                {STATUS_TRANSITIONS[detail.status] && (
                  <div>
                    <p className="text-sm font-semibold mb-2" style={{ color: 'var(--coffee-light)' }}>Update Status</p>
                    <div className="flex gap-2">
                      {STATUS_TRANSITIONS[detail.status].map((s: string) => (
                        <button key={s} onClick={() => update_status_mut.mutate({ id: detail.id, status: s })}
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
