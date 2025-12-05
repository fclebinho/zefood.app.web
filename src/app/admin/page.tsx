'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Users, UtensilsCrossed, Car, Package } from 'lucide-react';

interface DashboardMetrics {
  totalUsers: number;
  totalRestaurants: number;
  totalDrivers: number;
  totalOrders: number;
  pendingRestaurants: number;
  activeDrivers: number;
  todayOrders: number;
  todayRevenue: number;
}

interface OrdersByStatus {
  status: string;
  count: number;
}

interface RevenueByDay {
  date: string;
  revenue: number;
  orders: number;
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  PREPARING: 'Preparando',
  READY: 'Pronto',
  PICKED_UP: 'Retirado',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500',
  CONFIRMED: 'bg-blue-500',
  PREPARING: 'bg-orange-500',
  READY: 'bg-green-500',
  PICKED_UP: 'bg-purple-500',
  DELIVERED: 'bg-green-700',
  CANCELLED: 'bg-red-500',
};

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [ordersByStatus, setOrdersByStatus] = useState<OrdersByStatus[]>([]);
  const [revenueByDay, setRevenueByDay] = useState<RevenueByDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [metricsRes, statusRes, revenueRes] = await Promise.all([
        api.get<DashboardMetrics>('/admin/dashboard'),
        api.get<OrdersByStatus[]>('/admin/dashboard/orders-by-status'),
        api.get<RevenueByDay[]>('/admin/dashboard/revenue-by-day'),
      ]);
      setMetrics(metricsRes.data);
      setOrdersByStatus(statusRes.data);
      setRevenueByDay(revenueRes.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const totalOrdersByStatus = ordersByStatus.reduce((acc, o) => acc + o.count, 0);
  const maxRevenue = Math.max(...revenueByDay.map((r) => r.revenue), 1);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total de Usuários</p>
              <p className="text-3xl font-bold text-gray-900">{metrics?.totalUsers || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Restaurantes</p>
              <p className="text-3xl font-bold text-gray-900">{metrics?.totalRestaurants || 0}</p>
              {metrics?.pendingRestaurants ? (
                <p className="text-yellow-600 text-sm mt-1">
                  {metrics.pendingRestaurants} pendente(s)
                </p>
              ) : null}
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <UtensilsCrossed className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Entregadores</p>
              <p className="text-3xl font-bold text-gray-900">{metrics?.totalDrivers || 0}</p>
              <p className="text-green-600 text-sm mt-1">
                {metrics?.activeDrivers || 0} online
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Car className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pedidos Hoje</p>
              <p className="text-3xl font-bold text-gray-900">{metrics?.todayOrders || 0}</p>
              <p className="text-green-600 text-sm mt-1">
                {formatCurrency(metrics?.todayRevenue || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Package className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Orders by Status */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pedidos por Status
          </h2>
          <div className="space-y-3">
            {ordersByStatus.map((item) => (
              <div key={item.status}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">
                    {statusLabels[item.status] || item.status}
                  </span>
                  <span className="font-medium">{item.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`${statusColors[item.status] || 'bg-gray-500'} h-3 rounded-full transition-all`}
                    style={{
                      width: `${totalOrdersByStatus ? (item.count / totalOrdersByStatus) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {ordersByStatus.length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhum pedido encontrado</p>
            )}
          </div>
        </div>

        {/* Revenue by Day */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Receita dos Últimos 7 Dias
          </h2>
          <div className="flex items-end justify-between gap-2 h-48">
            {revenueByDay.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center">
                  <span className="text-xs text-gray-500 mb-1">
                    {formatCurrency(day.revenue)}
                  </span>
                  <div
                    className="w-full bg-red-500 rounded-t transition-all"
                    style={{
                      height: `${maxRevenue ? (day.revenue / maxRevenue) * 150 : 0}px`,
                      minHeight: day.revenue > 0 ? '10px' : '2px',
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 mt-2">
                  {new Date(day.date).toLocaleDateString('pt-BR', {
                    weekday: 'short',
                  })}
                </span>
              </div>
            ))}
            {revenueByDay.length === 0 && (
              <div className="w-full text-center text-gray-500 py-4">
                Nenhum dado de receita
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Estatísticas Gerais
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{metrics?.totalOrders || 0}</p>
            <p className="text-gray-500 text-sm">Total de Pedidos</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {metrics?.totalOrders && metrics?.totalUsers
                ? (metrics.totalOrders / metrics.totalUsers).toFixed(1)
                : '0'}
            </p>
            <p className="text-gray-500 text-sm">Pedidos/Usuário</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {metrics?.totalDrivers && metrics?.activeDrivers
                ? Math.round((metrics.activeDrivers / metrics.totalDrivers) * 100)
                : 0}%
            </p>
            <p className="text-gray-500 text-sm">Entregadores Online</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {revenueByDay.reduce((acc, d) => acc + d.orders, 0)}
            </p>
            <p className="text-gray-500 text-sm">Pedidos (7 dias)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
