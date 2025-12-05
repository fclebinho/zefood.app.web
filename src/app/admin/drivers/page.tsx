'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Car } from 'lucide-react';

interface Driver {
  id: string;
  vehicleType: string;
  vehiclePlate: string;
  status: string;
  isAvailable: boolean;
  createdAt: string;
  user: { id: string; name: string; email: string; phone: string };
  _count: { orders: number };
}

interface PaginatedResponse {
  data: Driver[];
  total: number;
  page: number;
  totalPages: number;
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  SUSPENDED: 'Suspenso',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  SUSPENDED: 'bg-red-100 text-red-800',
};

const vehicleLabels: Record<string, string> = {
  MOTORCYCLE: 'Moto',
  BICYCLE: 'Bicicleta',
  CAR: 'Carro',
};

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  useEffect(() => {
    loadDrivers();
  }, [page, statusFilter]);

  const loadDrivers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);

      const response = await api.get<PaginatedResponse>(`/admin/drivers?${params}`);
      setDrivers(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error loading drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadDrivers();
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/drivers/${id}/status`, { status });
      loadDrivers();
      setSelectedDriver(null);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestão de Entregadores</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar por nome..."
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
            <option value="pending">Pendente</option>
            <option value="approved">Aprovado</option>
            <option value="available">Online</option>
            <option value="unavailable">Offline</option>
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
                  Entregador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Veículo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Disponibilidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entregas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {drivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <Car className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{driver.user.name}</div>
                        <div className="text-sm text-gray-500">ID: {driver.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{driver.user.email}</div>
                    <div className="text-sm text-gray-500">{driver.user.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {vehicleLabels[driver.vehicleType] || driver.vehicleType}
                    </div>
                    <div className="text-sm text-gray-500">{driver.vehiclePlate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[driver.status]}`}
                    >
                      {statusLabels[driver.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        driver.isAvailable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {driver.isAvailable ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {driver._count.orders} entregas
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedDriver(driver)}
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
      {selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Gerenciar Entregador
            </h2>
            <div className="mb-4 space-y-2">
              <p className="text-gray-600">
                <strong>Nome:</strong> {selectedDriver.user.name}
              </p>
              <p className="text-gray-600">
                <strong>Email:</strong> {selectedDriver.user.email}
              </p>
              <p className="text-gray-600">
                <strong>Telefone:</strong> {selectedDriver.user.phone}
              </p>
              <p className="text-gray-600">
                <strong>Veículo:</strong>{' '}
                {vehicleLabels[selectedDriver.vehicleType] || selectedDriver.vehicleType}
              </p>
              <p className="text-gray-600">
                <strong>Placa:</strong> {selectedDriver.vehiclePlate}
              </p>
              <p className="text-gray-600">
                <strong>Total de Entregas:</strong> {selectedDriver._count.orders}
              </p>
              <p className="text-gray-600">
                <strong>Disponibilidade:</strong>{' '}
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    selectedDriver.isAvailable
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {selectedDriver.isAvailable ? 'Online' : 'Offline'}
                </span>
              </p>
              <p className="text-gray-600">
                <strong>Status atual:</strong>{' '}
                <span
                  className={`px-2 py-1 rounded-full text-xs ${statusColors[selectedDriver.status]}`}
                >
                  {statusLabels[selectedDriver.status]}
                </span>
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {selectedDriver.status !== 'APPROVED' && (
                <button
                  onClick={() => updateStatus(selectedDriver.id, 'APPROVED')}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Aprovar Entregador
                </button>
              )}
              {selectedDriver.status !== 'SUSPENDED' && (
                <button
                  onClick={() => updateStatus(selectedDriver.id, 'SUSPENDED')}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Suspender Entregador
                </button>
              )}
              {selectedDriver.status !== 'PENDING' && (
                <button
                  onClick={() => updateStatus(selectedDriver.id, 'PENDING')}
                  className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                >
                  Marcar como Pendente
                </button>
              )}
              <button
                onClick={() => setSelectedDriver(null)}
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
