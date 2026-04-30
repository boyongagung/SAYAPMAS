'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth_store';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  const router = useRouter();
  useEffect(() => { if (!token) router.push('/login'); }, [token, router]);
  if (!token) return null;
  return <>{children}</>;
}
