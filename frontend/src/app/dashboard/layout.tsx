'use client';
import ProtectedRoute from '@/components/protected_route';
import MainLayout from '@/components/main_layout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  );
}
