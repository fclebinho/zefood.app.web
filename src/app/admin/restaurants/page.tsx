'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import { UtensilsCrossed } from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  status: string;
  imageUrl: string | null;
  createdAt: string;
  owner: { id: string; name: string; email: string };
  _count: { orders: number; menuItems: number };
}

interface PaginatedResponse {
  data: Restaurant[];
  total: number;
  page: number;
  totalPages: number;
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  SUSPENDED: 'Suspenso',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  SUSPENDED: 'bg-red-100 text-red-800',
};

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    loadRestaurants();
  }, [page, statusFilter]);

  const loadRestaurants = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);

      const response = await api.get<PaginatedResponse>(`/admin/restaurants?${params}`);
      setRestaurants(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error loading restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadRestaurants();
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/restaurants/${id}/status`, { status });
      loadRestaurants();
      setSelectedRestaurant(null);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestão de Restaurantes</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar por nome ou proprietário..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Todos os status</option>
            <option value="PENDING">Pendente</option>
            <option value="ACTIVE">Ativo</option>
            <option value="INACTIVE">Inativo</option>
            <option value="SUSPENDED">Suspenso</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Restaurante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proprietário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Itens/Pedidos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {restaurants.map((restaurant) => (
                <tr key={restaurant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden mr-3">
                        {restaurant.imageUrl ? (
                          <img
                            src={restaurant.imageUrl}
                            alt={restaurant.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <UtensilsCrossed className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{restaurant.name}</div>
                        <div className="text-sm text-gray-500">{restaurant.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{restaurant.owner.name}</div>
                    <div className="text-sm text-gray-500">{restaurant.owner.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[restaurant.status]}`}
                    >
                      {statusLabels[restaurant.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {restaurant._count.menuItems} itens / {restaurant._count.orders} pedidos
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(restaurant.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedRestaurant(restaurant)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Gerenciar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Página {page} de {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Próximo
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Gerenciar Restaurante
            </h2>
            <div className="mb-4">
              <p className="text-gray-600">
                <strong>Nome:</strong> {selectedRestaurant.name}
              </p>
              <p className="text-gray-600">
                <strong>Proprietário:</strong> {selectedRestaurant.owner.name}
              </p>
              <p className="text-gray-600">
                <strong>Email:</strong> {selectedRestaurant.owner.email}
              </p>
              <p className="text-gray-600">
                <strong>Telefone:</strong> {selectedRestaurant.phone}
              </p>
              <p className="text-gray-600">
                <strong>Endereço:</strong> {selectedRestaurant.address}
              </p>
              <p className="text-gray-600">
                <strong>Status atual:</strong>{' '}
                <span className={`px-2 py-1 rounded-full text-xs ${statusColors[selectedRestaurant.status]}`}>
                  {statusLabels[selectedRestaurant.status]}
                </span>
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {selectedRestaurant.status !== 'ACTIVE' && (
                <button
                  onClick={() => updateStatus(selectedRestaurant.id, 'ACTIVE')}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Ativar Restaurante
                </button>
              )}
              {selectedRestaurant.status !== 'SUSPENDED' && (
                <button
                  onClick={() => updateStatus(selectedRestaurant.id, 'SUSPENDED')}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Suspender Restaurante
                </button>
              )}
              {selectedRestaurant.status !== 'INACTIVE' && (
                <button
                  onClick={() => updateStatus(selectedRestaurant.id, 'INACTIVE')}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Desativar Restaurante
                </button>
              )}
              <button
                onClick={() => setSelectedRestaurant(null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
