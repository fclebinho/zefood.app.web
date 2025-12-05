'use client';

import { useState } from 'react';
import { Clock, MapPin, Phone, Mail, Save, Camera, UtensilsCrossed } from 'lucide-react';

interface RestaurantSettings {
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  deliveryFee: string;
  minOrder: string;
  prepTime: string;
  openingHours: {
    [key: string]: { open: string; close: string; isOpen: boolean };
  };
}

const daysOfWeek = [
  { id: 'monday', label: 'Segunda-feira' },
  { id: 'tuesday', label: 'Terça-feira' },
  { id: 'wednesday', label: 'Quarta-feira' },
  { id: 'thursday', label: 'Quinta-feira' },
  { id: 'friday', label: 'Sexta-feira' },
  { id: 'saturday', label: 'Sábado' },
  { id: 'sunday', label: 'Domingo' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<RestaurantSettings>({
    name: 'Burger King',
    description: 'Os melhores hambúrgueres da cidade',
    phone: '(11) 99999-9999',
    email: 'contato@burgerking.com',
    address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
    deliveryFee: '5.00',
    minOrder: '20.00',
    prepTime: '30',
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

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // await api.patch('/restaurants/my/settings', settings);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Erro ao salvar configurações');
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
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              <MapPin className="mr-1 inline h-4 w-4" />
              Endereço
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Delivery Settings */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Configurações de Entrega</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Taxa de Entrega (R$)
            </label>
            <input
              type="number"
              step="0.01"
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
              value={settings.minOrder}
              onChange={(e) => setSettings({ ...settings, minOrder: e.target.value })}
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
              value={settings.prepTime}
              onChange={(e) => setSettings({ ...settings, prepTime: e.target.value })}
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
