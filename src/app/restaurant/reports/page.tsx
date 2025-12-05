'use client';

import { useState } from 'react';
import { Calendar, TrendingUp, DollarSign, ShoppingBag, Users } from 'lucide-react';

export default function ReportsPage() {
  const [period, setPeriod] = useState('week');

  const stats = [
    {
      title: 'Faturamento Total',
      value: 'R$ 12.450,00',
      change: '+12%',
      positive: true,
      icon: DollarSign,
    },
    {
      title: 'Total de Pedidos',
      value: '342',
      change: '+8%',
      positive: true,
      icon: ShoppingBag,
    },
    {
      title: 'Ticket Médio',
      value: 'R$ 36,40',
      change: '+3%',
      positive: true,
      icon: TrendingUp,
    },
    {
      title: 'Novos Clientes',
      value: '48',
      change: '-5%',
      positive: false,
      icon: Users,
    },
  ];

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
              <p className={`mt-1 text-sm ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change} vs período anterior
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Vendas por Dia</h3>
          <div className="flex h-64 items-center justify-center text-gray-400">
            Gráfico de vendas (em desenvolvimento)
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Pedidos por Hora</h3>
          <div className="flex h-64 items-center justify-center text-gray-400">
            Gráfico de pedidos (em desenvolvimento)
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="mb-4 font-semibold text-gray-900">Produtos Mais Vendidos</h3>
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
              {[
                { name: 'Whopper', qty: 156, revenue: 'R$ 4.664,40', percent: '37%' },
                { name: 'Whopper Duplo', qty: 98, revenue: 'R$ 3.910,20', percent: '31%' },
                { name: 'Batata Frita G', qty: 142, revenue: 'R$ 2.115,80', percent: '17%' },
                { name: 'Coca-Cola 350ml', qty: 189, revenue: 'R$ 1.304,10', percent: '10%' },
                { name: 'Milk Shake', qty: 45, revenue: 'R$ 715,50', percent: '5%' },
              ].map((product) => (
                <tr key={product.name} className="text-sm">
                  <td className="py-3 font-medium text-gray-900">{product.name}</td>
                  <td className="py-3 text-gray-600">{product.qty}</td>
                  <td className="py-3 text-gray-600">{product.revenue}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-orange-500"
                          style={{ width: product.percent }}
                        />
                      </div>
                      <span className="text-gray-600">{product.percent}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
