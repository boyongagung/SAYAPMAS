'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ProtectedRoute from '@/components/protected_route';
import MainLayout from '@/components/main_layout';
import api from '@/services/api';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';

interface Area { id: number; name: string; description: string; }

const fetch_areas = () => api.get('/api/v1/areas/?limit=100').then(r => r.data.data);

export default function AreasPage() {
  const qc = useQueryClient();
  const { data: areas = [], isLoading } = useQuery({ queryKey: ['areas'], queryFn: fetch_areas });

  const [modal, set_modal] = useState(false);
  const [edit_data, set_edit_data] = useState<Area | null>(null);
  const [form, set_form] = useState({ name: '', description: '' });
  const [error, set_error] = useState('');

  const create_mut = useMutation({
    mutationFn: (d: typeof form) => api.post('/api/v1/areas', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['areas'] }); close_modal(); },
    onError: (e: any) => set_error(e.response?.data?.message ?? 'Gagal'),
  });

  const update_mut = useMutation({
    mutationFn: (d: typeof form) => api.put(`/api/v1/areas/${edit_data?.id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['areas'] }); close_modal(); },
    onError: (e: any) => set_error(e.response?.data?.message ?? 'Gagal'),
  });

  const delete_mut = useMutation({
    mutationFn: (id: number) => api.delete(`/api/v1/areas/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['areas'] }),
  });

  const open_create = () => { set_edit_data(null); set_form({ name: '', description: '' }); set_error(''); set_modal(true); };
  const open_edit = (a: Area) => { set_edit_data(a); set_form({ name: a.name, description: a.description }); set_error(''); set_modal(true); };
  const close_modal = () => { set_modal(false); set_edit_data(null); set_error(''); };
  const handle_submit = () => { edit_data ? update_mut.mutate(form) : create_mut.mutate(form); };
  const is_loading_mut = create_mut.isPending || update_mut.isPending;

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--coffee-dark)' }}>Areas</h1>
            <button onClick={open_create}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
              style={{ backgroundColor: 'var(--coffee-mid)', color: 'var(--cream-bg)' }}>
              <Plus size={16} /> Tambah Area
            </button>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--cream-border)' }}>
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: 'var(--cream-card)' }}>
                <tr>
                  {['ID', 'Nama', 'Deskripsi', 'Aksi'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold"
                      style={{ color: 'var(--coffee-light)', borderBottom: '1px solid var(--cream-border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'var(--cream-card)' }}>
                {isLoading
                  ? <tr><td colSpan={4} className="px-4 py-8 text-center" style={{ color: 'var(--coffee-light)' }}>Loading...</td></tr>
                  : areas.map((a: Area) => (
                    <tr key={a.id} className="border-t" style={{ borderColor: 'var(--cream-border)' }}>
                      <td className="px-4 py-3 font-mono" style={{ color: 'var(--coffee-light)' }}>{a.id}</td>
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--coffee-dark)' }}>{a.name}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--coffee-light)' }}>{a.description}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => open_edit(a)} className="p-1.5 rounded hover:opacity-70"
                            style={{ color: 'var(--coffee-mid)' }}><Pencil size={14} /></button>
                          <button onClick={() => delete_mut.mutate(a.id)} className="p-1.5 rounded hover:opacity-70"
                            style={{ color: 'var(--red-danger)' }}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {modal && (
          <div className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
            <div className="w-full max-w-md rounded-2xl p-6 shadow-xl"
              style={{ backgroundColor: 'var(--cream-card)', borderColor: 'var(--cream-border)' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-lg font-bold" style={{ color: 'var(--coffee-dark)' }}>
                  {edit_data ? 'Edit Area' : 'Tambah Area'}
                </h2>
                <button onClick={close_modal} style={{ color: 'var(--coffee-light)' }}><X size={18} /></button>
              </div>
              <div className="space-y-4">
                {[{ label: 'Nama', key: 'name' }, { label: 'Deskripsi', key: 'description' }].map(f => (
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
