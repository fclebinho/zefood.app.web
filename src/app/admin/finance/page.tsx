'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  ArrowDownRight,
  AlertCircle,
  Loader2,
  RefreshCw,
  Building2,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCheck,
  X,
} from 'lucide-react';
import api from '@/services/api';

interface FinancialOverview {
  totalEarnings: number;
  totalPlatformFees: number;
  totalPaymentFees: number;
  totalNetToRestaurants: number;
  pendingPayoutsCount: number;
  pendingPayoutsAmount: number;
  completedPayoutsCount: number;
  completedPayoutsAmount: number;
  restaurantsWithPendingPayouts: number;
}

interface PendingPayout {
  id: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  payoutMethod: 'PIX' | 'TED' | 'DOC';
  reference?: string;
  periodStart: string;
  periodEnd: string;
  earningsCount: number;
  requestedAt: string;
  processedAt?: string;
  notes?: string;
  restaurant: {
    id: string;
    name: string;
    bankAccount?: {
      bankName: string;
      agency: string;
      accountNumber: string;
      accountDigit: string;
      pixKey?: string;
      isVerified: boolean;
    };
  };
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'pending' | 'history'>('overview');
  const [overview, setOverview] = useState<FinancialOverview | null>(null);
  const [pendingPayouts, setPendingPayouts] = useState<PendingPayout[]>([]);
  const [allPayouts, setAllPayouts] = useState<PendingPayout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayout, setSelectedPayout] = useState<PendingPayout | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [processSuccess, setProcessSuccess] = useState<string | null>(null);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [overviewRes, pendingRes, allRes] = await Promise.all([
        api.get<FinancialOverview>('/admin/finance/overview'),
        api.get<PaginatedResponse<PendingPayout>>('/admin/finance/pending-payouts?limit=50'),
        api.get<PaginatedResponse<PendingPayout>>(`/admin/finance/payouts?page=${currentPage}&limit=10`),
      ]);

      setOverview(overviewRes.data);
      setPendingPayouts(pendingRes.data.data);
      setAllPayouts(allRes.data.data);
      setTotalPages(allRes.data.pagination.totalPages);
    } catch (error) {
      console.error('Error loading finance data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
    };

    const labels: Record<string, string> = {
      PENDING: 'Pendente',
      PROCESSING: 'Processando',
      COMPLETED: 'Concluído',
      FAILED: 'Falhou',
    };

    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const handleProcessPayout = async () => {
    if (!selectedPayout) return;

    setIsProcessing(true);
    setProcessError(null);
    setProcessSuccess(null);

    try {
      await api.patch(`/admin/finance/payouts/${selectedPayout.id}/process`, {
        reference,
        notes,
      });

      setProcessSuccess('Repasse processado com sucesso!');
      setShowProcessModal(false);
      setSelectedPayout(null);
      setReference('');
      setNotes('');
      loadData();
    } catch (error: any) {
      setProcessError(error.response?.data?.message || 'Erro ao processar repasse');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelPayout = async () => {
    if (!selectedPayout) return;

    setIsProcessing(true);
    setProcessError(null);

    try {
      await api.patch(`/admin/finance/payouts/${selectedPayout.id}/cancel`, {
        notes,
      });

      setProcessSuccess('Repasse cancelado com sucesso!');
      setShowCancelModal(false);
      setSelectedPayout(null);
      setNotes('');
      loadData();
    } catch (error: any) {
      setProcessError(error.response?.data?.message || 'Erro ao cancelar repasse');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredPayouts = pendingPayouts.filter(
    (payout) =>
      payout.restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Repasses</h1>
          <p className="text-gray-500">Gerencie os repasses para restaurantes</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </button>
      </div>

      {/* Success/Error Messages */}
      {processSuccess && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle className="h-5 w-5" />
          {processSuccess}
          <button onClick={() => setProcessSuccess(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {processError && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5" />
          {processError}
          <button onClick={() => setProcessError(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Repasses Pendentes</span>
            <div className="rounded-lg bg-yellow-100 p-2">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-yellow-600">
              {overview?.pendingPayoutsCount || 0}
            </span>
            <p className="mt-1 text-sm text-gray-500">
              {formatCurrency(overview?.pendingPayoutsAmount || 0)}
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Repasses Concluídos</span>
            <div className="rounded-lg bg-green-100 p-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-green-600">
              {overview?.completedPayoutsCount || 0}
            </span>
            <p className="mt-1 text-sm text-gray-500">
              {formatCurrency(overview?.completedPayoutsAmount || 0)}
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Taxa Plataforma</span>
            <div className="rounded-lg bg-blue-100 p-2">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-blue-600">
              {formatCurrency(overview?.totalPlatformFees || 0)}
            </span>
            <p className="mt-1 text-sm text-gray-500">15% comissão</p>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Total Líquido</span>
            <div className="rounded-lg bg-gray-100 p-2">
              <ArrowDownRight className="h-5 w-5 text-gray-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-gray-900">
              {formatCurrency(overview?.totalNetToRestaurants || 0)}
            </span>
            <p className="mt-1 text-sm text-gray-500">Para restaurantes</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex gap-6">
          {[
            { id: 'overview', label: 'Visão Geral' },
            { id: 'pending', label: `Pendentes (${pendingPayouts.length})` },
            { id: 'history', label: 'Histórico' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`border-b-2 pb-4 text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Financial Summary */}
          <div className="rounded-xl border bg-white p-6">
            <h3 className="mb-4 font-semibold text-gray-900">Resumo Financeiro</h3>
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Faturamento Bruto (Restaurantes)</span>
                <span className="font-semibold">{formatCurrency(overview?.totalEarnings || 0)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Taxa da Plataforma (15%)</span>
                <span className="font-semibold text-green-600">
                  +{formatCurrency(overview?.totalPlatformFees || 0)}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Taxa de Pagamento (3.5%)</span>
                <span className="font-semibold text-green-600">
                  +{formatCurrency(overview?.totalPaymentFees || 0)}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="font-semibold text-gray-900">Líquido para Restaurantes</span>
                <span className="font-bold text-gray-900">
                  {formatCurrency(overview?.totalNetToRestaurants || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Pending Actions */}
          <div className="rounded-xl border bg-white p-6">
            <h3 className="mb-4 font-semibold text-gray-900">Ações Pendentes</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-900">Repasses para processar</p>
                    <p className="text-sm text-yellow-700">
                      {overview?.pendingPayoutsCount} repasses pendentes
                    </p>
                  </div>
                </div>
                <span className="font-bold text-yellow-900">
                  {formatCurrency(overview?.pendingPayoutsAmount || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Restaurantes aguardando</p>
                    <p className="text-sm text-blue-700">
                      {overview?.restaurantsWithPendingPayouts} restaurantes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por restaurante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border pl-10 pr-4 py-2 focus:border-red-500 focus:outline-none"
            />
          </div>

          {/* Pending Payouts Table */}
          <div className="rounded-xl border bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-sm text-gray-500">
                    <th className="px-6 py-4 font-medium">Restaurante</th>
                    <th className="px-6 py-4 font-medium">Valor</th>
                    <th className="px-6 py-4 font-medium">Método</th>
                    <th className="px-6 py-4 font-medium">Período</th>
                    <th className="px-6 py-4 font-medium">Pedidos</th>
                    <th className="px-6 py-4 font-medium">Solicitado em</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredPayouts.length > 0 ? (
                    filteredPayouts.map((payout) => (
                      <tr key={payout.id} className="text-sm hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{payout.restaurant.name}</p>
                            {payout.restaurant.bankAccount && (
                              <p className="text-xs text-gray-500">
                                {payout.restaurant.bankAccount.bankName} - Ag{' '}
                                {payout.restaurant.bankAccount.agency}
                                {payout.restaurant.bankAccount.isVerified ? (
                                  <span className="ml-2 text-green-600">Verificada</span>
                                ) : (
                                  <span className="ml-2 text-yellow-600">Não verificada</span>
                                )}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {formatCurrency(payout.amount)}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{payout.payoutMethod}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {formatDate(payout.periodStart)} - {formatDate(payout.periodEnd)}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{payout.earningsCount}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {formatDateTime(payout.requestedAt)}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(payout.status)}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedPayout(payout);
                                setShowProcessModal(true);
                              }}
                              className="rounded bg-green-100 p-2 text-green-700 hover:bg-green-200"
                              title="Processar repasse"
                            >
                              <CheckCheck className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPayout(payout);
                                setShowCancelModal(true);
                              }}
                              className="rounded bg-red-100 p-2 text-red-700 hover:bg-red-200"
                              title="Cancelar repasse"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        Nenhum repasse pendente
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* History Table */}
          <div className="rounded-xl border bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-sm text-gray-500">
                    <th className="px-6 py-4 font-medium">Restaurante</th>
                    <th className="px-6 py-4 font-medium">Valor</th>
                    <th className="px-6 py-4 font-medium">Método</th>
                    <th className="px-6 py-4 font-medium">Referência</th>
                    <th className="px-6 py-4 font-medium">Solicitado em</th>
                    <th className="px-6 py-4 font-medium">Processado em</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {allPayouts.length > 0 ? (
                    allPayouts.map((payout) => (
                      <tr key={payout.id} className="text-sm hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {payout.restaurant.name}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {formatCurrency(payout.amount)}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{payout.payoutMethod}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {payout.reference || '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {formatDateTime(payout.requestedAt)}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {payout.processedAt ? formatDateTime(payout.processedAt) : '-'}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(payout.status)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        Nenhum repasse encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-6 py-4">
                <p className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded border px-3 py-1 text-sm disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded border px-3 py-1 text-sm disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Process Payout Modal */}
      {showProcessModal && selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Processar Repasse</h3>

            <div className="mb-4 rounded-lg bg-gray-50 p-4">
              <p className="font-medium text-gray-900">{selectedPayout.restaurant.name}</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(selectedPayout.amount)}
              </p>
              {selectedPayout.restaurant.bankAccount && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>{selectedPayout.restaurant.bankAccount.bankName}</p>
                  <p>
                    Ag: {selectedPayout.restaurant.bankAccount.agency} / CC:{' '}
                    {selectedPayout.restaurant.bankAccount.accountNumber}-
                    {selectedPayout.restaurant.bankAccount.accountDigit}
                  </p>
                  {selectedPayout.restaurant.bankAccount.pixKey && (
                    <p>PIX: {selectedPayout.restaurant.bankAccount.pixKey}</p>
                  )}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Referência da Transferência
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ex: ID da transação PIX"
                className="w-full rounded-lg border px-4 py-2 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Observações (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione observações sobre o repasse..."
                rows={3}
                className="w-full rounded-lg border px-4 py-2 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowProcessModal(false);
                  setSelectedPayout(null);
                  setReference('');
                  setNotes('');
                }}
                className="flex-1 rounded-lg border px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleProcessPayout}
                disabled={isProcessing}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirmar Repasse
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Payout Modal */}
      {showCancelModal && selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-red-600">Cancelar Repasse</h3>

            <div className="mb-4 rounded-lg bg-red-50 p-4">
              <p className="font-medium text-gray-900">{selectedPayout.restaurant.name}</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(selectedPayout.amount)}
              </p>
              <p className="mt-2 text-sm text-red-700">
                Ao cancelar, os ganhos voltarão para o saldo disponível do restaurante.
              </p>
            </div>

            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Motivo do cancelamento
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Informe o motivo do cancelamento..."
                rows={3}
                className="w-full rounded-lg border px-4 py-2 focus:border-red-500 focus:outline-none"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedPayout(null);
                  setNotes('');
                }}
                className="flex-1 rounded-lg border px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Voltar
              </button>
              <button
                onClick={handleCancelPayout}
                disabled={isProcessing || !notes}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                Cancelar Repasse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
