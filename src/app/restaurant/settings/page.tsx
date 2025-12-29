'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, MapPin, Phone, Mail, Save, Camera, UtensilsCrossed, Loader2 } from 'lucide-react';
import { BankAccountForm, BankAccount } from '@/components/restaurant/BankAccountForm';
import api from '@/services/api';
import { toast } from 'sonner';

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

interface RestaurantHour {
  dayOfWeek: number;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
}

interface RestaurantApiResponse {
  name: string;
  description: string;
  phone: string;
  email: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  deliveryFee: number;
  minOrderValue: number;
  avgPrepTime: number;
  deliveryRadius: number;
  isOpen: boolean;
  hours?: RestaurantHour[];
}

interface RestaurantSettings {
  name: string;
  description: string;
  phone: string;
  email: string;
  // Address fields
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  // Delivery settings
  deliveryFee: string;
  minOrderValue: string;
  avgPrepTime: string;
  deliveryRadius: string;
  isOpen: boolean;
  openingHours: {
    [key: string]: { open: string; close: string; isOpen: boolean };
  };
}

const daysOfWeek = [
  { id: 'monday', dayOfWeek: 1, label: 'Segunda-feira' },
  { id: 'tuesday', dayOfWeek: 2, label: 'Terça-feira' },
  { id: 'wednesday', dayOfWeek: 3, label: 'Quarta-feira' },
  { id: 'thursday', dayOfWeek: 4, label: 'Quinta-feira' },
  { id: 'friday', dayOfWeek: 5, label: 'Sexta-feira' },
  { id: 'saturday', dayOfWeek: 6, label: 'Sábado' },
  { id: 'sunday', dayOfWeek: 0, label: 'Domingo' },
];

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings>({
    name: '',
    description: '',
    phone: '',
    email: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    deliveryFee: '0',
    minOrderValue: '0',
    avgPrepTime: '30',
    deliveryRadius: '5',
    isOpen: false,
    openingHours: {
      monday: { open: '11:00', close: '23:00', isOpen: true },
      tuesday: { open: '11:00', close: '23:00', isOpen: true },
      wednesday: { open: '11:00', close: '23:00', isOpen: true },
      thursday: { open: '11:00', close: '23:00', isOpen: true },
      friday: { open: '11:00', close: '00:00', isOpen: true },
      saturday: { open: '11:00', close: '00:00', isOpen: true },
      sunday: { open: '12:00', close: '22:00', isOpen: true },
    },
  });

  const loadBankAccount = useCallback(async () => {
    try {
      const response = await api.get<BankAccount | null>('/restaurant-finance/bank-account');
      setBankAccount(response.data);
    } catch {
      // Bank account may not exist yet
      setBankAccount(null);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const response = await api.get<RestaurantApiResponse>('/restaurants/my/settings');
      const data = response.data;

      // Parse opening hours from API format
      const openingHours: RestaurantSettings['openingHours'] = {};
      daysOfWeek.forEach((day) => {
        const hour = data.hours?.find((h) => h.dayOfWeek === day.dayOfWeek);
        if (hour) {
          const openTime = hour.openTime ? new Date(hour.openTime).toISOString().slice(11, 16) : '11:00';
          const closeTime = hour.closeTime ? new Date(hour.closeTime).toISOString().slice(11, 16) : '23:00';
          openingHours[day.id] = {
            open: openTime,
            close: closeTime,
            isOpen: !hour.isClosed,
          };
        } else {
          openingHours[day.id] = { open: '11:00', close: '23:00', isOpen: true };
        }
      });

      setSettings({
        name: data.name || '',
        description: data.description || '',
        phone: data.phone || '',
        email: data.email || '',
        zipCode: data.zipCode || '',
        street: data.street || '',
        number: data.number || '',
        complement: data.complement || '',
        neighborhood: data.neighborhood || '',
        city: data.city || '',
        state: data.state || '',
        deliveryFee: data.deliveryFee?.toString() || '0',
        minOrderValue: data.minOrderValue?.toString() || '0',
        avgPrepTime: data.avgPrepTime?.toString() || '30',
        deliveryRadius: data.deliveryRadius?.toString() || '5',
        isOpen: data.isOpen || false,
        openingHours,
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    loadBankAccount();
  }, [loadSettings, loadBankAccount]);

  const fetchAddressFromCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
      return;
    }

    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data: ViaCepResponse = await response.json();

      if (data.erro) {
        toast.error('CEP não encontrado');
        return;
      }

      setSettings((prev) => ({
        ...prev,
        street: data.logradouro || prev.street,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
      }));

      if (data.logradouro) {
        toast.success('Endereço preenchido automaticamente');
      }
    } catch {
      toast.error('Erro ao buscar CEP');
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleCepChange = (value: string) => {
    // Format CEP as user types: 00000-000
    const cleanValue = value.replace(/\D/g, '');
    let formattedValue = cleanValue;

    if (cleanValue.length > 5) {
      formattedValue = `${cleanValue.slice(0, 5)}-${cleanValue.slice(5, 8)}`;
    }

    setSettings((prev) => ({ ...prev, zipCode: formattedValue }));

    // Auto-fetch when CEP is complete
    if (cleanValue.length === 8) {
      fetchAddressFromCep(cleanValue);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Build opening hours array for API
      const openingHours = daysOfWeek.map((day) => ({
        dayOfWeek: day.dayOfWeek,
        openTime: settings.openingHours[day.id]?.open || '11:00',
        closeTime: settings.openingHours[day.id]?.close || '23:00',
        isClosed: !settings.openingHours[day.id]?.isOpen,
      }));

      await api.patch('/restaurants/my/settings', {
        name: settings.name,
        description: settings.description || undefined,
        phone: settings.phone || undefined,
        email: settings.email || undefined,
        zipCode: settings.zipCode,
        street: settings.street,
        number: settings.number,
        complement: settings.complement || undefined,
        neighborhood: settings.neighborhood,
        city: settings.city,
        state: settings.state,
        deliveryFee: parseFloat(settings.deliveryFee) || 0,
        minOrderValue: parseFloat(settings.minOrderValue) || 0,
        avgPrepTime: parseInt(settings.avgPrepTime) || 30,
        deliveryRadius: parseInt(settings.deliveryRadius) || 5,
        openingHours,
      });

      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDay = (day: string) => {
    setSettings((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          isOpen: !prev.openingHours[day].isOpen,
        },
      },
    }));
  };

  const updateHours = (day: string, field: 'open' | 'close', value: string) => {
    setSettings((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value,
        },
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-500">Gerencie as informações do seu restaurante</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salvar Alterações
        </button>
      </div>

      {/* Profile Section */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Perfil do Restaurante</h2>

        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-orange-100">
            <UtensilsCrossed className="h-10 w-10 text-orange-600" />
          </div>
          <button className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            <Camera className="h-4 w-4" />
            Alterar Logo
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nome do Restaurante
            </label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Descrição
            </label>
            <input
              type="text"
              value={settings.description}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              <Phone className="mr-1 inline h-4 w-4" />
              Telefone
            </label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              <Mail className="mr-1 inline h-4 w-4" />
              E-mail
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Address Section */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          <MapPin className="mr-2 inline h-5 w-5" />
          Endereço
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">CEP</label>
            <div className="relative">
              <input
                type="text"
                value={settings.zipCode}
                onChange={(e) => handleCepChange(e.target.value)}
                maxLength={9}
                placeholder="00000-000"
                className="w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:outline-none"
              />
              {isLoadingCep && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">Digite o CEP para preencher automaticamente</p>
          </div>

          <div className="md:col-span-2 lg:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Rua/Avenida</label>
            <input
              type="text"
              value={settings.street}
              onChange={(e) => setSettings({ ...settings, street: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Número</label>
            <input
              type="text"
              value={settings.number}
              onChange={(e) => setSettings({ ...settings, number: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Complemento</label>
            <input
              type="text"
              value={settings.complement}
              onChange={(e) => setSettings({ ...settings, complement: e.target.value })}
              placeholder="Sala, Loja, etc."
              className="w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Bairro</label>
            <input
              type="text"
              value={settings.neighborhood}
              onChange={(e) => setSettings({ ...settings, neighborhood: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Cidade</label>
            <input
              type="text"
              value={settings.city}
              onChange={(e) => setSettings({ ...settings, city: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Estado</label>
            <input
              type="text"
              value={settings.state}
              onChange={(e) => setSettings({ ...settings, state: e.target.value.toUpperCase() })}
              maxLength={2}
              placeholder="SP"
              className="w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Delivery Settings */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Configurações de Entrega</h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Taxa de Entrega (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={settings.deliveryFee}
              onChange={(e) => setSettings({ ...settings, deliveryFee: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Pedido Mínimo (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={settings.minOrderValue}
              onChange={(e) => setSettings({ ...settings, minOrderValue: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              <Clock className="mr-1 inline h-4 w-4" />
              Tempo de Preparo (min)
            </label>
            <input
              type="number"
              min="1"
              value={settings.avgPrepTime}
              onChange={(e) => setSettings({ ...settings, avgPrepTime: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Raio de Entrega (km)
            </label>
            <input
              type="number"
              min="1"
              value={settings.deliveryRadius}
              onChange={(e) => setSettings({ ...settings, deliveryRadius: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Opening Hours */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          <Clock className="mr-2 inline h-5 w-5" />
          Horário de Funcionamento
        </h2>

        <div className="space-y-3">
          {daysOfWeek.map((day) => (
            <div
              key={day.id}
              className="flex items-center gap-4 rounded-lg border p-3"
            >
              <button
                onClick={() => toggleDay(day.id)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  settings.openingHours[day.id]?.isOpen ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    settings.openingHours[day.id]?.isOpen ? 'left-5' : 'left-0.5'
                  }`}
                />
              </button>

              <span className="w-32 text-sm font-medium text-gray-700">{day.label}</span>

              {settings.openingHours[day.id]?.isOpen ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={settings.openingHours[day.id]?.open || ''}
                    onChange={(e) => updateHours(day.id, 'open', e.target.value)}
                    className="rounded-lg border px-2 py-1 text-sm focus:border-orange-500 focus:outline-none"
                  />
                  <span className="text-gray-400">até</span>
                  <input
                    type="time"
                    value={settings.openingHours[day.id]?.close || ''}
                    onChange={(e) => updateHours(day.id, 'close', e.target.value)}
                    className="rounded-lg border px-2 py-1 text-sm focus:border-orange-500 focus:outline-none"
                  />
                </div>
              ) : (
                <span className="text-sm text-gray-400">Fechado</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bank Account */}
      <BankAccountForm
        bankAccount={bankAccount}
        onSave={loadBankAccount}
      />

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="mb-2 text-lg font-semibold text-red-700">Zona de Perigo</h2>
        <p className="mb-4 text-sm text-red-600">
          Ações irreversíveis para sua conta
        </p>
        <div className="flex gap-3">
          <button className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100">
            Pausar Restaurante
          </button>
          <button className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100">
            Excluir Conta
          </button>
        </div>
      </div>
    </div>
  );
}
