'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth_store';
import { LayoutDashboard, Map, Users, ShoppingBag, Package, Truck, Wallet, LogOut, Coffee } from 'lucide-react';

const ADMIN_NAV = [
  { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/areas',      label: 'Areas',       icon: Map },
  { href: '/salesmen',   label: 'Salesmen',    icon: Users },
  { href: '/customers',  label: 'Customers',   icon: ShoppingBag },
  { href: '/products',   label: 'Products',    icon: Package },
  { href: '/orders',     label: 'Orders',      icon: Package },
  { href: '/deliveries', label: 'Deliveries',  icon: Truck },
  { href: '/finance',    label: 'Finance',     icon: Wallet },
];

const SALESMAN_NAV = [
  { href: '/salesman/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/salesman/order',     label: 'Buat Order', icon: Package },
  { href: '/salesman/history',   label: 'History',    icon: ShoppingBag },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clear_auth } = useAuthStore();
  const nav = user?.role === 'salesman' ? SALESMAN_NAV : ADMIN_NAV;

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex flex-col w-60 shrink-0 overflow-y-auto" style={{ backgroundColor: 'var(--coffee-dark)' }}>
        <div className="flex items-center gap-2 px-5 py-5 border-b" style={{ borderColor: 'var(--coffee-mid)' }}>
          <Coffee size={22} style={{ color: 'var(--amber-accent)' }} />
          <span className="font-display text-lg font-semibold" style={{ color: 'var(--cream-bg)' }}>ERP Samas</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors"
                style={{
                  color: active ? 'var(--amber-accent)' : 'var(--cream-border)',
                  backgroundColor: active ? 'rgba(255,143,0,0.12)' : 'transparent',
                }}>
                <Icon size={16} />{label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t text-xs" style={{ borderColor: 'var(--coffee-mid)', color: 'var(--cream-border)' }}>
          <p className="mb-1 font-medium">{user?.username}</p>
          <p className="mb-3 uppercase tracking-wide" style={{ color: 'var(--coffee-light)' }}>{user?.role}</p>
          <button onClick={() => { clear_auth(); router.push('/login'); }}
            className="flex items-center gap-2 text-sm hover:opacity-80"
            style={{ color: 'var(--red-danger)' }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: 'var(--cream-bg)' }}>
        {children}
      </main>
    </div>
  );
}
