'use client';

import { useState } from 'react';
import { Building2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '@/services/api';

export interface BankAccount {
  id: string;
  holderName: string;
  holderDocument: string;
  bankCode: string;
  bankName: string;
  accountType: 'CHECKING' | 'SAVINGS';
  agency: string;
  agencyDigit?: string;
  accountNumber: string;
  accountDigit: string;
  pixKey?: string;
  pixKeyType?: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM';
  isVerified: boolean;
}

interface BankAccountFormProps {
  bankAccount: BankAccount | null;
  onSave: () => void;
}

const banks = [
  { code: '001', name: 'Banco do Brasil' },
  { code: '033', name: 'Santander' },
  { code: '104', name: 'Caixa Econômica Federal' },
  { code: '237', name: 'Bradesco' },
  { code: '341', name: 'Itaú Unibanco' },
  { code: '260', name: 'Nubank' },
  { code: '077', name: 'Inter' },
  { code: '336', name: 'C6 Bank' },
  { code: '212', name: 'Banco Original' },
  { code: '756', name: 'Sicoob' },
];

export function BankAccountForm({ bankAccount, onSave }: BankAccountFormProps) {
  const [formData, setFormData] = useState({
    holderName: bankAccount?.holderName || '',
    holderDocument: bankAccount?.holderDocument || '',
    bankCode: bankAccount?.bankCode || '',
    bankName: bankAccount?.bankName || '',
    accountType: bankAccount?.accountType || 'CHECKING',
    agency: bankAccount?.agency || '',
    agencyDigit: bankAccount?.agencyDigit || '',
    accountNumber: bankAccount?.accountNumber || '',
    accountDigit: bankAccount?.accountDigit || '',
    pixKey: bankAccount?.pixKey || '',
    pixKeyType: bankAccount?.pixKeyType || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleBankChange = (code: string) => {
    const bank = banks.find((b) => b.code === code);
    setFormData({
      ...formData,
      bankCode: code,
      bankName: bank?.name || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await api.post('/restaurant-finance/bank-account', formData);
      setSuccess(true);
      onSave();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar conta bancária');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-blue-100 p-2">
          <Building2 className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Dados Bancários</h3>
          <p className="text-sm text-gray-500">Configure sua conta para receber os repasses</p>
        </div>
        {bankAccount?.isVerified && (
          <span className="ml-auto flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            <CheckCircle className="h-4 w-4" />
            Verificada
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Holder Info */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nome do Titular
            </label>
            <input
              type="text"
              value={formData.holderName}
              onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
              className="w-full rounded-lg border px-4 py-2 focus:border-orange-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              CPF/CNPJ do Titular
            </label>
            <input
              type="text"
              value={formData.holderDocument}
              onChange={(e) => setFormData({ ...formData, holderDocument: e.target.value })}
              placeholder="000.000.000-00"
              className="w-full rounded-lg border px-4 py-2 focus:border-orange-500 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Bank Info */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Banco
            </label>
            <select
              value={formData.bankCode}
              onChange={(e) => handleBankChange(e.target.value)}
              className="w-full rounded-lg border px-4 py-2 focus:border-orange-500 focus:outline-none"
              required
            >
              <option value="">Selecione o banco</option>
              {banks.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.code} - {bank.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tipo de Conta
            </label>
            <select
              value={formData.accountType}
              onChange={(e) => setFormData({ ...formData, accountType: e.target.value as 'CHECKING' | 'SAVINGS' })}
              className="w-full rounded-lg border px-4 py-2 focus:border-orange-500 focus:outline-none"
              required
            >
              <option value="CHECKING">Conta Corrente</option>
              <option value="SAVINGS">Conta Poupança</option>
            </select>
          </div>
        </div>

        {/* Account Details */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Agência
            </label>
            <input
              type="text"
              value={formData.agency}
              onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
              placeholder="0000"
              className="w-full rounded-lg border px-4 py-2 focus:border-orange-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Dígito (opcional)
            </label>
            <input
              type="text"
              value={formData.agencyDigit}
              onChange={(e) => setFormData({ ...formData, agencyDigit: e.target.value })}
              placeholder="0"
              className="w-full rounded-lg border px-4 py-2 focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Conta
            </label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              placeholder="00000000"
              className="w-full rounded-lg border px-4 py-2 focus:border-orange-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Dígito
            </label>
            <input
              type="text"
              value={formData.accountDigit}
              onChange={(e) => setFormData({ ...formData, accountDigit: e.target.value })}
              placeholder="0"
              className="w-full rounded-lg border px-4 py-2 focus:border-orange-500 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* PIX */}
        <div className="border-t pt-6">
          <h4 className="mb-4 font-medium text-gray-900">Chave PIX (opcional)</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tipo de Chave
              </label>
              <select
                value={formData.pixKeyType}
                onChange={(e) => setFormData({ ...formData, pixKeyType: e.target.value })}
                className="w-full rounded-lg border px-4 py-2 focus:border-orange-500 focus:outline-none"
              >
                <option value="">Selecione</option>
                <option value="CPF">CPF</option>
                <option value="CNPJ">CNPJ</option>
                <option value="EMAIL">E-mail</option>
                <option value="PHONE">Telefone</option>
                <option value="RANDOM">Chave Aleatória</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Chave PIX
              </label>
              <input
                type="text"
                value={formData.pixKey}
                onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                placeholder="Digite sua chave PIX"
                className="w-full rounded-lg border px-4 py-2 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            <CheckCircle className="h-5 w-5" />
            Dados bancários salvos com sucesso!
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-2 font-medium text-white transition hover:bg-orange-600 disabled:opacity-50"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {bankAccount ? 'Atualizar Dados' : 'Salvar Dados'}
          </button>
        </div>
      </form>
    </div>
  );
}
