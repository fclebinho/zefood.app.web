'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, Clock, DollarSign, TrendingUp, Star, Power } from 'lucide-react';
import api from '@/services/api';

interface Restaurant {
  id: string;
  name: string;
  isOpen: boolean;
}

interface OrderStats {
  newOrders: number;
  preparing: number;
  todayCompleted: number;
  todayRevenue: number;
}

interface Order {
  id: string;
  status: string;
  total: number;
  items: Array<{ quantity: number; menuItem: { name: string } }>;
  customer: { fullName: string };
  createdAt: string;
}

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
  percent: number;
}

interface ReportsData {
  topProducts: TopProduct[];
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500',
  CONFIRMED: 'bg-blue-500',
  PREPARING: 'bg-blue-500',
  READY: 'bg-green-500',
  OUT_FOR_DELIVERY: 'bg-purple-500',
  DELIVERED: 'bg-gray-500',
  CANCELLED: 'bg-red-500',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Novo',
  CONFIRMED: 'Confirmado',
  PREPARING: 'Preparando',
  READY: 'Pronto',
  OUT_FOR_DELIVERY: 'Saiu para entrega',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
};

export default function RestaurantDashboard() {
  const [stats, setStats] = useState<OrderStats>({
    newOrders: 0,
    preparing: 0,
    todayCompleted: 0,
    todayRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [ordersRes, restaurantRes, reportsRes] = await Promise.all([
        api.get<Order[]>('/restaurants/my/orders'),
        api.get<Restaurant>('/restaurants/my/profile'),
        api.get<ReportsData>('/restaurants/my/reports?period=week'),
      ]);
      const orders = ordersRes.data;
      setRestaurant(restaurantRes.data);
      setTopProducts(reportsRes.data.topProducts || []);

      // Calculate stats
      const newOrders = orders.filter((o: Order) => o.status === 'PENDING').length;
      const preparing = orders.filter((o: Order) =>
        o.status === 'CONFIRMED' || o.status === 'PREPARING'
      ).length;

      const today = new Date().toDateString();
      const todayOrders = orders.filter((o: Order) =>
        new Date(o.createdAt).toDateString() === today
      );
      const todayCompleted = todayOrders.filter((o: Order) =>
        o.status === 'DELIVERED'
      ).length;
      const todayRevenue = todayOrders
        .filter((o: Order) => o.status !== 'CANCELLED')
        .reduce((sum: number, o: Order) => sum + Number(o.total || 0), 0);

      setStats({ newOrders, preparing, todayCompleted, todayRevenue: Number(todayRevenue) || 0 });
      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOnlineStatus = async () => {
    if (isTogglingStatus) return;
    setIsTogglingStatus(true);
    try {
      const response = await api.patch<Restaurant>('/restaurants/my/toggle-status');
      setRestaurant(response.data);
    } catch (error) {
      console.error('Error toggling status:', error);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const statsCards = [
    {
      title: 'Novos Pedidos',
      value: stats.newOrders.toString(),
      icon: ShoppingBag,
      description: 'aguardando aceite',
      color: 'text-yellow-600 bg-yellow-100',
    },
    {
      title: 'Preparando',
      value: stats.preparing.toString(),
      icon: Clock,
      description: 'pedidos em preparo',
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: 'Hoje',
      value: stats.todayCompleted.toString(),
      icon: TrendingUp,
      description: 'pedidos finalizados',
      color: 'text-green-600 bg-green-100',
    },
    {
      title: 'Faturamento',
      value: `R$ ${stats.todayRevenue.toFixed(2)}`,
      icon: DollarSign,
      description: 'hoje',
      color: 'text-orange-600 bg-orange-100',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Visão geral do seu restaurante</p>
        </div>

        {/* Online/Offline Toggle */}
        <button
          onClick={toggleOnlineStatus}
          disabled={isTogglingStatus}
          className={`flex items-center gap-3 rounded-full px-5 py-2.5 font-medium transition-all ${
            restaurant?.isOpen
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          } ${isTogglingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Power className={`h-5 w-5 ${isTogglingStatus ? 'animate-pulse' : ''}`} />
          <span>{restaurant?.isOpen ? 'Online' : 'Offline'}</span>
          <div
            className={`h-3 w-3 rounded-full ${
              restaurant?.isOpen ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <div key={stat.title} className="rounded-xl border bg-white p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">{stat.title}</span>
              <div className={`rounded-lg p-2 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
              <p className="mt-1 text-sm text-gray-500">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border bg-white">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold text-gray-900">Pedidos Recentes</h2>
        </div>
        <div className="divide-y">
          {recentOrders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Nenhum pedido ainda
            </div>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      Pedido #{order.id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.customer?.fullName || 'Cliente'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    R$ {Number(order.total || 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium text-white ${
                    statusColors[order.status] || 'bg-gray-500'
                  }`}
                >
                  {statusLabels[order.status] || order.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Products */}
        <div className="rounded-xl border bg-white p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Produtos Mais Vendidos</h3>
          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.slice(0, 4).map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="text-gray-500">{item.quantity} un</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-orange-500"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-gray-400">Nenhum produto vendido ainda</p>
            )}
          </div>
        </div>

        {/* Rating */}
        <div className="rounded-xl border bg-white p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Avaliações</h3>
          <div className="mb-4 flex items-center gap-2">
            <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
            <span className="text-3xl font-bold text-gray-900">4.5</span>
            <span className="text-gray-500">(234 avaliações)</span>
          </div>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-3 text-gray-600">{star}</span>
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <div className="h-2 flex-1 rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-yellow-400"
                    style={{
                      width: star === 5 ? '65%' : star === 4 ? '25%' : star === 3 ? '7%' : '3%',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
