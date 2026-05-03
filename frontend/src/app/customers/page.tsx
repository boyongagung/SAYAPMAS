'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ProtectedRoute from '@/components/protected_route';
import MainLayout from '@/components/main_layout';
import api from '@/services/api';
import { Plus, Pencil, Trash2, X, Check, MapPin } from 'lucide-react';

interface Customer { id: number; name: string; phone: string; address: string; latitude: number; longitude: number; area_id: number; }
interface Area { id: number; name: string; }

const fetch_customers = () => api.get('/api/v1/customers/?limit=100').then(r => r.data.data);
const fetch_areas     = () => api.get('/api/v1/areas/?limit=100').then(r => r.data.data);

const EMPTY = { name: '', phone: '', address: '', latitude: '', longitude: '', area_id: '' };

export default function CustomersPage() {
  const qc = useQueryClient();
  const { data: customers = [], isLoading } = useQuery({ queryKey: ['customers'], queryFn: fetch_customers });
  const { data: areas = [] } = useQuery({ queryKey: ['areas'], queryFn: fetch_areas });

  const [modal, set_modal] = useState(false);
  const [edit_data, set_edit_data] = useState<Customer | null>(null);
  const [form, set_form] = useState<typeof EMPTY>({ ...EMPTY });
  const [error, set_error] = useState('');

  const create_mut = useMutation({
    mutationFn: (d: any) => api.post('/api/v1/customers', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); close_modal(); },
    onError: (e: any) => set_error(e.response?.data?.message ?? 'Gagal'),
  });

  const update_mut = useMutation({
    mutationFn: (d: any) => api.put(`/api/v1/customers/${edit_data?.id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); close_modal(); },
    onError: (e: any) => set_error(e.response?.data?.message ?? 'Gagal'),
  });

  const delete_mut = useMutation({
    mutationFn: (id: number) => api.delete(`/api/v1/customers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });

  const open_create = () => { set_edit_data(null); set_form({ ...EMPTY }); set_error(''); set_modal(true); };
  const open_edit = (c: Customer) => {
    set_edit_data(c);
    set_form({ name: c.name, phone: c.phone, address: c.address, latitude: String(c.latitude), longitude: String(c.longitude), area_id: String(c.area_id) });
    set_error(''); set_modal(true);
  };
  const close_modal = () => { set_modal(false); set_edit_data(null); set_error(''); };
  const handle_submit = () => {
    const payload = { ...form, latitude: Number(form.latitude), longitude: Number(form.longitude), area_id: Number(form.area_id) };
    edit_data ? update_mut.mutate(payload) : create_mut.mutate(payload);
  };
  const is_loading_mut = create_mut.isPending || update_mut.isPending;
  const area_name = (id: number) => areas.find((a: Area) => a.id === id)?.name ?? id;

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--coffee-dark)' }}>Customers</h1>
            <button onClick={open_create}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
              style={{ backgroundColor: 'var(--coffee-mid)', color: 'var(--cream-bg)' }}>
              <Plus size={16} /> Tambah Customer
            </button>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--cream-border)' }}>
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: 'var(--cream-card)' }}>
                <tr>
                  {['Nama', 'Phone', 'Area', 'Alamat', 'GPS', 'Aksi'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold"
                      style={{ color: 'var(--coffee-light)', borderBottom: '1px solid var(--cream-border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'var(--cream-card)' }}>
                {isLoading
                  ? <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: 'var(--coffee-light)' }}>Loading...</td></tr>
                  : customers.map((c: Customer) => (
                    <tr key={c.id} className="border-t" style={{ borderColor: 'var(--cream-border)' }}>
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--coffee-dark)' }}>{c.name}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--coffee-dark)' }}>{c.phone}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--coffee-dark)' }}>{area_name(c.area_id)}</td>
                      <td className="px-4 py-3 max-w-xs truncate" style={{ color: 'var(--coffee-light)' }}>{c.address}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-xs font-mono" style={{ color: 'var(--coffee-light)' }}>
                          <MapPin size={11} />{c.latitude?.toFixed(4)}, {c.longitude?.toFixed(4)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => open_edit(c)} className="p-1.5 rounded hover:opacity-70"
                            style={{ color: 'var(--coffee-mid)' }}><Pencil size={14} /></button>
                          <button onClick={() => delete_mut.mutate(c.id)} className="p-1.5 rounded hover:opacity-70"
                            style={{ color: 'var(--red-danger)' }}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {modal && (
          <div className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
            <div className="w-full max-w-md rounded-2xl p-6 shadow-xl overflow-y-auto max-h-screen"
              style={{ backgroundColor: 'var(--cream-card)' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-lg font-bold" style={{ color: 'var(--coffee-dark)' }}>
                  {edit_data ? 'Edit Customer' : 'Tambah Customer'}
                </h2>
                <button onClick={close_modal} style={{ color: 'var(--coffee-light)' }}><X size={18} /></button>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Nama', key: 'name' },
                  { label: 'Phone', key: 'phone' },
                  { label: 'Alamat', key: 'address' },
                  { label: 'Latitude', key: 'latitude' },
                  { label: 'Longitude', key: 'longitude' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--coffee-light)' }}>{f.label}</label>
                    <input value={(form as any)[f.key]} onChange={e => set_form(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
                      style={{ backgroundColor: 'var(--cream-bg)', borderColor: 'var(--cream-border)', color: 'var(--coffee-dark)' }} />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--coffee-light)' }}>Area</label>
                  <select value={form.area_id} onChange={e => set_form(p => ({ ...p, area_id: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
                    style={{ backgroundColor: 'var(--cream-bg)', borderColor: 'var(--cream-border)', color: 'var(--coffee-dark)' }}>
                    <option value="">Pilih Area</option>
                    {areas.map((a: Area) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
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
