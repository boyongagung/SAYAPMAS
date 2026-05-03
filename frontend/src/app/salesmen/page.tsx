'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '@/services/api';
import { Pencil, Trash2, Plus, X } from 'lucide-react';

interface Salesman { id: number; nama: string; phone: string; id_area: number; salesman_code: string; is_active: boolean; }
interface Area { id: number; name: string; }

const fetch_salesmen = () => api.get('/api/v1/salesmen/?limit=100').then(r => r.data.data);
const fetch_areas    = () => api.get('/api/v1/areas/?limit=100').then(r => r.data.data);

const EMPTY = { nama: '', phone: '', id_area: '', salesman_code: '' };

export default function SalesmenPage() {
  const qc = useQueryClient();
  const { data: salesmen = [] } = useQuery({ queryKey: ['salesmen'], queryFn: fetch_salesmen });
  const { data: areas = [] }    = useQuery({ queryKey: ['areas'],    queryFn: fetch_areas });

  const [modal, set_modal] = useState(false);
  const [edit_id, set_edit_id] = useState<number | null>(null);
  const [form, set_form] = useState({ ...EMPTY });

  const area_name = (id: number) => areas.find((a: Area) => a.id === id)?.name ?? id;

  const save = useMutation({
    mutationFn: (d: any) => edit_id
      ? api.put(`/api/v1/salesmen/${edit_id}`, d)
      : api.post('/api/v1/salesmen/', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['salesmen'] }); close_modal(); },
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/api/v1/salesmen/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['salesmen'] }),
  });

  const open_edit = (s: Salesman) => {
    set_edit_id(s.id);
    set_form({ nama: s.nama, phone: s.phone, id_area: String(s.id_area), salesman_code: s.salesman_code });
    set_modal(true);
  };

  const close_modal = () => { set_modal(false); set_edit_id(null); set_form({ ...EMPTY }); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--coffee-dark)' }}>Salesmen</h1>
        <button onClick={() => set_modal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: 'var(--coffee-mid)', color: 'var(--cream-bg)' }}>
          <Plus size={16} /> Tambah
        </button>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--cream-border)' }}>
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: 'var(--cream-card)' }}>
            <tr>
              {['Kode', 'Nama', 'Phone', 'Area', 'Aksi'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold"
                  style={{ color: 'var(--coffee-light)', borderBottom: '1px solid var(--cream-border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody style={{ backgroundColor: 'var(--cream-card)' }}>
            {salesmen.map((s: Salesman) => (
              <tr key={s.id} className="border-t" style={{ borderColor: 'var(--cream-border)' }}>
                <td className="px-4 py-3 font-mono" style={{ color: 'var(--coffee-light)' }}>{s.salesman_code}</td>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--coffee-dark)' }}>{s.nama}</td>
                <td className="px-4 py-3" style={{ color: 'var(--coffee-dark)' }}>{s.phone}</td>
                <td className="px-4 py-3" style={{ color: 'var(--coffee-dark)' }}>{area_name(s.id_area)}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => open_edit(s)} className="hover:opacity-70"><Pencil size={14} style={{ color: 'var(--coffee-mid)' }} /></button>
                  <button onClick={() => remove.mutate(s.id)} className="hover:opacity-70"><Trash2 size={14} style={{ color: 'var(--red-danger)' }} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ backgroundColor: 'var(--cream-card)' }}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--coffee-dark)' }}>
                {edit_id ? 'Edit Salesman' : 'Tambah Salesman'}
              </h2>
              <button onClick={close_modal}><X size={18} /></button>
            </div>
            {[
              { label: 'Kode Salesman', key: 'salesman_code' },
              { label: 'Nama Lengkap', key: 'nama' },
              { label: 'Phone', key: 'phone' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--coffee-light)' }}>{label}</label>
                <input value={(form as any)[key]} onChange={e => set_form(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                  style={{ borderColor: 'var(--cream-border)', backgroundColor: 'var(--cream-bg)', color: 'var(--coffee-dark)' }} />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--coffee-light)' }}>Area</label>
              <select value={form.id_area} onChange={e => set_form(f => ({ ...f, id_area: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ borderColor: 'var(--cream-border)', backgroundColor: 'var(--cream-bg)', color: 'var(--coffee-dark)' }}>
                <option value="">Pilih Area</option>
                {areas.map((a: Area) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <button onClick={() => save.mutate({ ...form, id_area: Number(form.id_area) })}
              disabled={save.isPending}
              className="w-full py-2 rounded-lg text-sm font-semibold"
              style={{ backgroundColor: 'var(--coffee-mid)', color: 'var(--cream-bg)' }}>
              {save.isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
