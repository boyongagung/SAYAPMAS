'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth_store';
import api from '@/services/api';
import { Coffee, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { set_auth } = useAuthStore();
  const [username, set_username] = useState('');
  const [password, set_password] = useState('');
  const [loading, set_loading] = useState(false);
  const [error, set_error] = useState('');

  const handle_submit = async () => {
  set_error('');
  set_loading(true);
  try {
    const { data } = await api.post('/api/v1/auth/login', {
      username,
      password,
    });
    set_auth(data.data.access_token, data.data.user);
    router.push(data.data.user.role === 'salesman' ? '/salesman/dashboard' : '/dashboard');
  } catch (err: any) {
    set_error(err.response?.data?.message ?? 'Login gagal');
  } finally {
    set_loading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--cream-bg)' }}>
      <div className="w-full max-w-sm rounded-2xl p-8 shadow-md border"
        style={{ backgroundColor: 'var(--cream-card)', borderColor: 'var(--cream-border)' }}>
        <div className="flex items-center justify-center gap-2 mb-8">
          <Coffee size={28} style={{ color: 'var(--coffee-mid)' }} />
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--coffee-dark)' }}>ERP Samas</h1>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--coffee-light)' }}>Username</label>
            <input type="text" value={username} onChange={(e) => set_username(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handle_submit()}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
              style={{ backgroundColor: 'var(--cream-bg)', borderColor: 'var(--cream-border)', color: 'var(--coffee-dark)' }}
              placeholder="username" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--coffee-light)' }}>Password</label>
            <input type="password" value={password} onChange={(e) => set_password(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handle_submit()}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
              style={{ backgroundColor: 'var(--cream-bg)', borderColor: 'var(--cream-border)', color: 'var(--coffee-dark)' }}
              placeholder="••••••••" />
          </div>
          {error && <p className="text-sm" style={{ color: 'var(--red-danger)' }}>{error}</p>}
          <button onClick={handle_submit} disabled={loading}
            className="w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: 'var(--coffee-mid)', color: 'var(--cream-bg)' }}>
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Loading...' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
