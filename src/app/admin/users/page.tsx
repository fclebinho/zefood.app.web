'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
  _count: { orders: number };
}

interface PaginatedResponse {
  data: User[];
  total: number;
  page: number;
  totalPages: number;
}

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  CUSTOMER: 'Cliente',
  RESTAURANT: 'Restaurante',
  DRIVER: 'Entregador',
};

const roleColors: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-800',
  CUSTOMER: 'bg-blue-100 text-blue-800',
  RESTAURANT: 'bg-orange-100 text-orange-800',
  DRIVER: 'bg-green-100 text-green-800',
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [page, roleFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      if (roleFilter) params.append('role', roleFilter);
      if (search) params.append('search', search);

      const response = await api.get<PaginatedResponse>(`/admin/users?${params}`);
      setUsers(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadUsers();
  };

  const updateRole = async (id: string, role: string) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      loadUsers();
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await api.delete(`/admin/users/${id}`);
      loadUsers();
      setSelectedUser(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestão de Usuários</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Todos os tipos</option>
            <option value="ADMIN">Administrador</option>
            <option value="CUSTOMER">Cliente</option>
            <option value="RESTAURANT">Restaurante</option>
            <option value="DRIVER">Entregador</option>
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
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedidos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cadastro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xl">👤</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[user.role]}`}
                    >
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user._count.orders} pedidos
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedUser(user)}
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
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Gerenciar Usuário
            </h2>
            <div className="mb-4 space-y-2">
              <p className="text-gray-600">
                <strong>Nome:</strong> {selectedUser.name}
              </p>
              <p className="text-gray-600">
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <p className="text-gray-600">
                <strong>Telefone:</strong> {selectedUser.phone || '-'}
              </p>
              <p className="text-gray-600">
                <strong>Pedidos:</strong> {selectedUser._count.orders}
              </p>
              <p className="text-gray-600">
                <strong>Tipo atual:</strong>{' '}
                <span className={`px-2 py-1 rounded-full text-xs ${roleColors[selectedUser.role]}`}>
                  {roleLabels[selectedUser.role]}
                </span>
              </p>
            </div>

            {!showDeleteConfirm ? (
              <>
                <p className="text-sm text-gray-500 mb-2">Alterar tipo:</p>
                <div className="flex flex-col gap-2 mb-4">
                  {Object.entries(roleLabels).map(([role, label]) => (
                    <button
                      key={role}
                      onClick={() => updateRole(selectedUser.id, role)}
                      disabled={selectedUser.role === role}
                      className={`w-full px-4 py-2 rounded-lg transition-colors ${
                        selectedUser.role === role
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : `${roleColors[role]} hover:opacity-80`
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="border-t pt-4 mt-4">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Excluir Usuário
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <p className="text-red-800 font-medium mb-4">
                  Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => deleteUser(selectedUser.id)}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Confirmar Exclusão
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setSelectedUser(null);
                setShowDeleteConfirm(false);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 mt-2"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
