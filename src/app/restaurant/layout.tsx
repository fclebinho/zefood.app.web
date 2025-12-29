'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ClipboardList, UtensilsCrossed, BarChart3, Settings, Bell, Power, LogOut, Wallet } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import packageJson from '../../../package.json';

const sidebarItems = [
  { href: '/restaurant', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/restaurant/orders', icon: ClipboardList, label: 'Pedidos' },
  { href: '/restaurant/menu', icon: UtensilsCrossed, label: 'Cardápio' },
  { href: '/restaurant/finance', icon: Wallet, label: 'Finanças' },
  { href: '/restaurant/reports', icon: BarChart3, label: 'Relatórios' },
  { href: '/restaurant/settings', icon: Settings, label: 'Configurações' },
];

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/restaurant');
    }
    if (!isLoading && isAuthenticated && user?.role !== 'RESTAURANT') {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'RESTAURANT') {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r bg-white">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <UtensilsCrossed className="h-6 w-6 text-orange-500" />
          <span className="font-bold text-gray-900">ZeFood</span>
          <span className="ml-auto rounded bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600">
            Restaurante
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/restaurant' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">
                {user?.email}
              </p>
              <p className="text-xs text-gray-500">Restaurante</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
          <p className="mt-3 text-center text-xs text-gray-400">
            v{packageJson.version}
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64 flex-1">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-3 w-3 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-gray-700">Online</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                3
              </span>
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
              <Power className="h-4 w-4" />
              Ficar Offline
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
