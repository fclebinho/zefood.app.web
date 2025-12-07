'use client';

import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, DollarSign, ShoppingBag, Users } from 'lucide-react';
import api from '@/services/api';

interface ReportStats {
  totalRevenue: number;
  totalOrders: number;
  avgTicket: number;
  uniqueCustomers: number;
}

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
  percent: number;
}

interface RevenueByDay {
  date: string;
  dayOfWeek: string;
  revenue: number;
  orders: number;
}

interface OrdersByHour {
  hour: string;
  orders: number;
}

interface ReportsData {
  stats: ReportStats;
  topProducts: TopProduct[];
  revenueByDay: RevenueByDay[];
  ordersByHour: OrdersByHour[];
}

export default function ReportsPage() {
  const [period, setPeriod] = useState('week');
  const [data, setData] = useState<ReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [period]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<ReportsData>(`/restaurants/my/reports?period=${period}`);
      setData(response.data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const stats = [
    {
      title: 'Faturamento Total',
      value: formatCurrency(data?.stats.totalRevenue || 0),
      icon: DollarSign,
    },
    {
      title: 'Total de Pedidos',
      value: data?.stats.totalOrders?.toString() || '0',
      icon: ShoppingBag,
    },
    {
      title: 'Ticket Médio',
      value: formatCurrency(data?.stats.avgTicket || 0),
      icon: TrendingUp,
    },
    {
      title: 'Clientes Únicos',
      value: data?.stats.uniqueCustomers?.toString() || '0',
      icon: Users,
    },
  ];

  const maxRevenue = Math.max(...(data?.revenueByDay?.map((d) => d.revenue) || [1]), 1);
  const maxOrders = Math.max(...(data?.ordersByHour?.map((h) => h.orders) || [1]), 1);

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
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-500">Acompanhe o desempenho do seu restaurante</p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
          >
            <option value="today">Hoje</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mês</option>
            <option value="year">Este ano</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.title} className="rounded-xl border bg-white p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">{stat.title}</span>
              <div className="rounded-lg bg-gray-100 p-2">
                <stat.icon className="h-5 w-5 text-gray-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue by Day Chart */}
        <div className="rounded-xl border bg-white p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Vendas por Dia</h3>
          {data?.revenueByDay && data.revenueByDay.length > 0 ? (
            <div className="flex h-64 items-end justify-between gap-2">
              {data.revenueByDay.map((day) => (
                <div key={day.date} className="flex flex-1 flex-col items-center">
                  <div
                    className="w-full rounded-t bg-orange-500 transition-all"
                    style={{
                      height: `${maxRevenue ? (day.revenue / maxRevenue) * 200 : 0}px`,
                      minHeight: day.revenue > 0 ? '10px' : '2px',
                    }}
                  />
                  <span className="mt-2 text-xs text-gray-500">{day.dayOfWeek}</span>
                  <span className="text-xs font-medium text-gray-700">
                    {formatCurrency(day.revenue)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-gray-400">
              Nenhum dado disponível
            </div>
          )}
        </div>

        {/* Orders by Hour Chart */}
        <div className="rounded-xl border bg-white p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Pedidos por Hora (Hoje)</h3>
          {data?.ordersByHour && data.ordersByHour.some((h) => h.orders > 0) ? (
            <div className="flex h-64 items-end justify-between gap-1 overflow-x-auto">
              {data.ordersByHour
                .filter((_, i) => i >= 8 && i <= 23)
                .map((hour) => (
                  <div key={hour.hour} className="flex flex-1 flex-col items-center">
                    <span className="mb-1 text-xs font-medium text-gray-700">{hour.orders}</span>
                    <div
                      className="w-full min-w-[20px] rounded-t bg-blue-500 transition-all"
                      style={{
                        height: `${maxOrders ? (hour.orders / maxOrders) * 180 : 0}px`,
                        minHeight: hour.orders > 0 ? '10px' : '2px',
                      }}
                    />
                    <span className="mt-2 text-xs text-gray-500">
                      {hour.hour.split(':')[0]}h
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-gray-400">
              Nenhum pedido hoje
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="mb-4 font-semibold text-gray-900">Produtos Mais Vendidos</h3>
        {data?.topProducts && data.topProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500">
                  <th className="pb-3 font-medium">Produto</th>
                  <th className="pb-3 font-medium">Quantidade</th>
                  <th className="pb-3 font-medium">Receita</th>
                  <th className="pb-3 font-medium">% do Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.topProducts.map((product, index) => (
                  <tr key={index} className="text-sm">
                    <td className="py-3 font-medium text-gray-900">{product.name}</td>
                    <td className="py-3 text-gray-600">{product.quantity}</td>
                    <td className="py-3 text-gray-600">{formatCurrency(product.revenue)}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-orange-500"
                            style={{ width: `${product.percent}%` }}
                          />
                        </div>
                        <span className="text-gray-600">{product.percent}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-gray-400">
            Nenhum produto vendido neste período
          </div>
        )}
      </div>
    </div>
  );
}
