'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ProtectedRoute from '@/components/protected_route';
import MainLayout from '@/components/main_layout';
import api from '@/services/api';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';

interface Salesman { id: number; full_name: string; phone: string; area_id: number; username: string; }
interface Area { id: number; name: string; }

const fetch_salesmen = () => api.get('/api/v1/salesmen/?limit=100').then(r => r.data.data);
const fetch_areas    = () => api.get('/api/v1/areas/?limit=100').then(r => r.data.data);

const EMPTY = { full_name: '', phone: '', area_id: '', username: '', password: '' };

export default function SalesmenPage() {
  const qc = useQueryClient();
  const { data: salesmen = [], isLoading } = useQuery({ queryKey: ['salesmen'], queryFn: fetch_salesmen });
  const { data: areas = [] } = useQuery({ queryKey: ['areas'], queryFn: fetch_areas });

  const [modal, set_modal] = useState(false);
  const [edit_data, set_edit_data] = useState<Salesman | null>(null);
  const [form, set_form] = useState<typeof EMPTY>({ ...EMPTY });
  const [error, set_error] = useState('');

  const create_mut = useMutation({
    mutationFn: (d: any) => api.post('/api/v1/salesmen', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['salesmen'] }); close_modal(); },
    onError: (e: any) => set_error(e.response?.data?.message ?? 'Gagal'),
  });

  const update_mut = useMutation({
    mutationFn: (d: any) => api.put(`/api/v1/salesmen/${edit_data?.id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['salesmen'] }); close_modal(); },
    onError: (e: any) => set_error(e.response?.data?.message ?? 'Gagal'),
  });

  const delete_mut = useMutation({
    mutationFn: (id: number) => api.delete(`/api/v1/salesmen/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['salesmen'] }),
  });

  const open_create = () => { set_edit_data(null); set_form({ ...EMPTY }); set_error(''); set_modal(true); };
  const open_edit = (s: Salesman) => {
    set_edit_data(s);
    set_form({ full_name: s.full_name, phone: s.phone, area_id: String(s.area_id), username: s.username, password: '' });
    set_error(''); set_modal(true);
  };
  const close_modal = () => { set_modal(false); set_edit_data(null); set_error(''); };
  const handle_submit = () => {
    const payload: any = { ...form, area_id: Number(form.area_id) };
    if (edit_data && !payload.password) delete payload.password;
    edit_data ? update_mut.mutate(payload) : create_mut.mutate(payload);
  };
  const is_loading_mut = create_mut.isPending || update_mut.isPending;
  const area_name = (id: number) => areas.find((a: Area) => a.id === id)?.name ?? id;

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--coffee-dark)' }}>Salesmen</h1>
            <button onClick={open_create}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
              style={{ backgroundColor: 'var(--coffee-mid)', color: 'var(--cream-bg)' }}>
              <Plus size={16} /> Tambah Salesman
            </button>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--cream-border)' }}>
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: 'var(--cream-card)' }}>
                <tr>
                  {['Nama', 'Username', 'Phone', 'Area', 'Aksi'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold"
                      style={{ color: 'var(--coffee-light)', borderBottom: '1px solid var(--cream-border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'var(--cream-card)' }}>
                {isLoading
                  ? <tr><td colSpan={5} className="px-4 py-8 text-center" style={{ color: 'var(--coffee-light)' }}>Loading...</td></tr>
                  : salesmen.map((s: Salesman) => (
                    <tr key={s.id} className="border-t" style={{ borderColor: 'var(--cream-border)' }}>
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--coffee-dark)' }}>{s.full_name}</td>
                      <td className="px-4 py-3 font-mono" style={{ color: 'var(--coffee-light)' }}>{s.username}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--coffee-dark)' }}>{s.phone}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--coffee-dark)' }}>{area_name(s.area_id)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => open_edit(s)} className="p-1.5 rounded hover:opacity-70"
                            style={{ color: 'var(--coffee-mid)' }}><Pencil size={14} /></button>
                          <button onClick={() => delete_mut.mutate(s.id)} className="p-1.5 rounded hover:opacity-70"
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
            <div className="w-full max-w-md rounded-2xl p-6 shadow-xl"
              style={{ backgroundColor: 'var(--cream-card)' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-lg font-bold" style={{ color: 'var(--coffee-dark)' }}>
                  {edit_data ? 'Edit Salesman' : 'Tambah Salesman'}
                </h2>
                <button onClick={close_modal} style={{ color: 'var(--coffee-light)' }}><X size={18} /></button>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Nama Lengkap', key: 'full_name' },
                  { label: 'Username', key: 'username' },
                  { label: 'Password', key: 'password', type: 'password' },
                  { label: 'Phone', key: 'phone' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--coffee-light)' }}>
                      {f.label}{f.key === 'password' && edit_data ? ' (kosongkan jika tidak diubah)' : ''}
                    </label>
                    <input type={f.type ?? 'text'} value={(form as any)[f.key]}
                      onChange={e => set_form(p => ({ ...p, [f.key]: e.target.value }))}
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
