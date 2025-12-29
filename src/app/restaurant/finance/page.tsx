'use client';

import { useState, useEffect } from 'react';
import {
  Wallet,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import api from '@/services/api';
import { BankAccount } from '@/components/restaurant/BankAccountForm';

interface EarningsSummary {
  totalGross: number;
  totalPlatformFee: number;
  totalPaymentFee: number;
  totalNet: number;
  pendingAmount: number;
  availableAmount: number;
  paidOutAmount: number;
  earningsCount: number;
}

interface Earning {
  id: string;
  orderId: string;
  grossAmount: number;
  platformFee: number;
  paymentFee: number;
  netAmount: number;
  feePercentage: number;
  status: 'PENDING' | 'AVAILABLE' | 'PAID_OUT';
  availableAt: string;
  createdAt: string;
  order: {
    orderNumber: number;
    total: number;
    createdAt: string;
    paymentMethod: string;
  };
}

interface Payout {
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

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'earnings' | 'payouts'>('overview');
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [payoutSuccess, setPayoutSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    setIsLoading(true);
    try {
      const [summaryRes, earningsRes, payoutsRes, bankRes] = await Promise.all([
        api.get<EarningsSummary>('/restaurant-finance/summary'),
        api.get<PaginatedResponse<Earning>>('/restaurant-finance/earnings?limit=10'),
        api.get<PaginatedResponse<Payout>>('/restaurant-finance/payouts?limit=10'),
        api.get<BankAccount | null>('/restaurant-finance/bank-account').catch(() => ({ data: null })),
      ]);

      setSummary(summaryRes.data);
      setEarnings(earningsRes.data.data);
      setPayouts(payoutsRes.data.data);
      setBankAccount(bankRes.data);
    } catch (error) {
      console.error('Error loading finance data:', error);
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

  const getStatusBadge = (status: string, type: 'earning' | 'payout') => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      AVAILABLE: 'bg-green-100 text-green-800',
      PAID_OUT: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
    };

    const labels: Record<string, string> = {
      PENDING: type === 'earning' ? 'Pendente' : 'Aguardando',
      AVAILABLE: 'Disponível',
      PAID_OUT: 'Pago',
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

  const handleRequestPayout = async () => {
    if (!bankAccount) {
      setPayoutError('Configure sua conta bancária primeiro');
      return;
    }

    setIsRequestingPayout(true);
    setPayoutError(null);
    setPayoutSuccess(null);

    try {
      const response = await api.post<{ success: boolean; amount?: number; error?: string }>(
        '/restaurant-finance/request-payout'
      );

      if (response.data.success) {
        setPayoutSuccess(`Saque de ${formatCurrency(response.data.amount || 0)} solicitado com sucesso!`);
        loadFinanceData();
      } else {
        setPayoutError(response.data.error || 'Erro ao solicitar saque');
      }
    } catch (error: any) {
      setPayoutError(error.message || 'Erro ao solicitar saque');
    } finally {
      setIsRequestingPayout(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finanças</h1>
          <p className="text-gray-500">Gerencie seus ganhos e saques</p>
        </div>
        <button
          onClick={loadFinanceData}
          className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Saldo Disponível</span>
            <div className="rounded-lg bg-green-100 p-2">
              <Wallet className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-green-600">
              {formatCurrency(summary?.availableAmount || 0)}
            </span>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Pendente</span>
            <div className="rounded-lg bg-yellow-100 p-2">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-gray-900">
              {formatCurrency(summary?.pendingAmount || 0)}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">Liberado em até 3 dias</p>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Total Sacado</span>
            <div className="rounded-lg bg-blue-100 p-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-gray-900">
              {formatCurrency(summary?.paidOutAmount || 0)}
            </span>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Faturamento Total</span>
            <div className="rounded-lg bg-gray-100 p-2">
              <ArrowUpRight className="h-5 w-5 text-gray-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-gray-900">
              {formatCurrency(summary?.totalNet || 0)}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">{summary?.earningsCount || 0} pedidos</p>
        </div>
      </div>

      {/* Payout Action */}
      <div className="rounded-xl border bg-gradient-to-r from-orange-50 to-orange-100 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Solicitar Saque</h3>
            <p className="text-sm text-gray-600">
              {bankAccount
                ? `Transferência para ${bankAccount.bankName} - Ag ${bankAccount.agency} / CC ${bankAccount.accountNumber}-${bankAccount.accountDigit}`
                : 'Configure sua conta bancária para receber saques'}
            </p>
          </div>
          <button
            onClick={handleRequestPayout}
            disabled={isRequestingPayout || !bankAccount || (summary?.availableAmount || 0) < 50}
            className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRequestingPayout ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ArrowDownRight className="h-5 w-5" />
            )}
            Sacar {formatCurrency(summary?.availableAmount || 0)}
          </button>
        </div>
        {payoutError && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-5 w-5" />
            {payoutError}
          </div>
        )}
        {payoutSuccess && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            <CheckCircle className="h-5 w-5" />
            {payoutSuccess}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex gap-6">
          {[
            { id: 'overview', label: 'Visão Geral' },
            { id: 'earnings', label: 'Ganhos' },
            { id: 'payouts', label: 'Saques' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`border-b-2 pb-4 text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
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
          {/* Recent Earnings */}
          <div className="rounded-xl border bg-white p-6">
            <h3 className="mb-4 font-semibold text-gray-900">Ganhos Recentes</h3>
            {earnings.length > 0 ? (
              <div className="space-y-4">
                {earnings.slice(0, 5).map((earning) => (
                  <div key={earning.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">Pedido #{earning.order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{formatDateTime(earning.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(earning.netAmount)}</p>
                      {getStatusBadge(earning.status, 'earning')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">Nenhum ganho registrado</p>
            )}
          </div>

          {/* Recent Payouts */}
          <div className="rounded-xl border bg-white p-6">
            <h3 className="mb-4 font-semibold text-gray-900">Saques Recentes</h3>
            {payouts.length > 0 ? (
              <div className="space-y-4">
                {payouts.slice(0, 5).map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{formatCurrency(payout.amount)}</p>
                      <p className="text-sm text-gray-500">{formatDateTime(payout.requestedAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{payout.payoutMethod}</p>
                      {getStatusBadge(payout.status, 'payout')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">Nenhum saque realizado</p>
            )}
          </div>

          {/* Fee Breakdown */}
          <div className="rounded-xl border bg-white p-6 lg:col-span-2">
            <h3 className="mb-4 font-semibold text-gray-900">Resumo de Taxas</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Total Bruto</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(summary?.totalGross || 0)}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Taxa da Plataforma (15%)</p>
                <p className="text-xl font-bold text-red-600">-{formatCurrency(summary?.totalPlatformFee || 0)}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Taxa de Pagamento (3.5%)</p>
                <p className="text-xl font-bold text-red-600">-{formatCurrency(summary?.totalPaymentFee || 0)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'earnings' && (
        <div className="rounded-xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-sm text-gray-500">
                  <th className="px-6 py-4 font-medium">Pedido</th>
                  <th className="px-6 py-4 font-medium">Data</th>
                  <th className="px-6 py-4 font-medium">Bruto</th>
                  <th className="px-6 py-4 font-medium">Taxas</th>
                  <th className="px-6 py-4 font-medium">Líquido</th>
                  <th className="px-6 py-4 font-medium">Disponível em</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {earnings.length > 0 ? (
                  earnings.map((earning) => (
                    <tr key={earning.id} className="text-sm">
                      <td className="px-6 py-4 font-medium text-gray-900">#{earning.order.orderNumber}</td>
                      <td className="px-6 py-4 text-gray-600">{formatDateTime(earning.createdAt)}</td>
                      <td className="px-6 py-4 text-gray-600">{formatCurrency(earning.grossAmount)}</td>
                      <td className="px-6 py-4 text-red-600">
                        -{formatCurrency(earning.platformFee + earning.paymentFee)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-green-600">{formatCurrency(earning.netAmount)}</td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(earning.availableAt)}</td>
                      <td className="px-6 py-4">{getStatusBadge(earning.status, 'earning')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Nenhum ganho registrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payouts' && (
        <div className="rounded-xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-sm text-gray-500">
                  <th className="px-6 py-4 font-medium">Data</th>
                  <th className="px-6 py-4 font-medium">Valor</th>
                  <th className="px-6 py-4 font-medium">Método</th>
                  <th className="px-6 py-4 font-medium">Período</th>
                  <th className="px-6 py-4 font-medium">Pedidos</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Processado em</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payouts.length > 0 ? (
                  payouts.map((payout) => (
                    <tr key={payout.id} className="text-sm">
                      <td className="px-6 py-4 text-gray-600">{formatDateTime(payout.requestedAt)}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(payout.amount)}</td>
                      <td className="px-6 py-4 text-gray-600">{payout.payoutMethod}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(payout.periodStart)} - {formatDate(payout.periodEnd)}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{payout.earningsCount}</td>
                      <td className="px-6 py-4">{getStatusBadge(payout.status, 'payout')}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {payout.processedAt ? formatDateTime(payout.processedAt) : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Nenhum saque realizado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
