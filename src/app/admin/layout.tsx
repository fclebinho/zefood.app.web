'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  Car,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Wallet,
} from 'lucide-react';
import packageJson from '../../../package.json';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/restaurants', label: 'Restaurantes', icon: UtensilsCrossed },
  { href: '/admin/orders', label: 'Pedidos', icon: Package },
  { href: '/admin/drivers', label: 'Entregadores', icon: Car },
  { href: '/admin/finance', label: 'Finanças', icon: Wallet },
  { href: '/admin/users', label: 'Usuários', icon: Users },
  { href: '/admin/settings', label: 'Configurações', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-xl font-bold text-red-500">ZeFood Admin</h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-800 rounded"
            >
              {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'bg-red-500 text-white'
                      : 'hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-800">
          {sidebarOpen && (
            <div className="mb-4">
              <p className="text-sm text-gray-400">Logado como:</p>
              <p className="font-medium truncate">{user?.name}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {sidebarOpen && 'Sair'}
          </button>
          {sidebarOpen && (
            <p className="mt-3 text-center text-xs text-gray-500">
              v{packageJson.version}
            </p>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
