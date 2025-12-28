'use client';

import { useState, useEffect } from 'react';
import { Truck, Banknote, CreditCard, Package, Settings, FileText, Save, RefreshCw, CheckCircle, XCircle, AlertCircle, Eye, EyeOff, Wallet, QrCode, DollarSign, Trash2, Archive } from 'lucide-react';

interface GatewayStatus {
  stripe: {
    configured: boolean;
    enabled: boolean;
  };
  mercadopago: {
    configured: boolean;
    enabled: boolean;
  };
  activeGateway: string;
}

interface Setting {
  id: string;
  key: string;
  value: string;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  category: string;
  label: string | null;
  description: string | null;
  isPublic: boolean;
  parsedValue: any;
}

interface Category {
  key: string;
  label: string;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  delivery: Truck,
  fees: Banknote,
  payment: CreditCard,
  orders: Package,
  general: Settings,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('delivery');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus | null>(null);
  const [isReinitializing, setIsReinitializing] = useState(false);
  const [activePaymentTab, setActivePaymentTab] = useState<string>('general');
  const [orphanedSettings, setOrphanedSettings] = useState<Setting[]>([]);
  const [showOrphaned, setShowOrphaned] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  // Payment sub-tabs configuration
  const paymentTabs = [
    { key: 'general', label: 'Geral', icon: Settings },
    { key: 'stripe', label: 'Stripe', icon: CreditCard },
    { key: 'mercadopago', label: 'Mercado Pago', icon: Wallet },
    { key: 'pagseguro', label: 'PagSeguro', icon: CreditCard },
    { key: 'pix', label: 'PIX', icon: QrCode },
    { key: 'cash', label: 'Dinheiro', icon: DollarSign },
  ];

  // Map settings to payment tabs based on their keys
  const getPaymentTabForSetting = (key: string): string => {
    if (key.startsWith('stripe')) return 'stripe';
    if (key.startsWith('mercadopago')) return 'mercadopago';
    if (key.startsWith('pagseguro')) return 'pagseguro';
    if (key.startsWith('pix')) return 'pix';
    if (key.startsWith('cash') || key === 'accept_cash') return 'cash';
    return 'general';
  };

  useEffect(() => {
    loadSettings();
    loadCategories();
    loadGatewayStatus();
    loadOrphanedSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load settings');

      const data = await response.json();
      setSettings(data);
    } catch (err) {
      setError('Erro ao carregar configuracoes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load categories');

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadGatewayStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/admin/gateway-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return;

      const data = await response.json();
      setGatewayStatus(data);
    } catch (err) {
      console.error('Error loading gateway status:', err);
    }
  };

  const loadOrphanedSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/orphaned`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return;

      const data = await response.json();
      setOrphanedSettings(data);
    } catch (err) {
      console.error('Error loading orphaned settings:', err);
    }
  };

  const deleteOrphanedSetting = async (key: string) => {
    setDeletingKey(key);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/${key}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete setting');

      setOrphanedSettings((prev) => prev.filter((s) => s.key !== key));
      setSuccessMessage(`Configuracao "${key}" removida com sucesso!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(`Erro ao remover configuracao "${key}"`);
      console.error(err);
    } finally {
      setDeletingKey(null);
    }
  };

  const reinitializeGateways = async () => {
    setIsReinitializing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/admin/reinitialize-gateways`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to reinitialize gateways');

      await loadGatewayStatus();
      setSuccessMessage('Gateways de pagamento reinicializados com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Erro ao reinicializar gateways');
      console.error(err);
    } finally {
      setIsReinitializing(false);
    }
  };

  const handleValueChange = (key: string, value: any) => {
    setEditedValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getDisplayValue = (setting: Setting) => {
    if (editedValues.hasOwnProperty(setting.key)) {
      return editedValues[setting.key];
    }
    return setting.parsedValue;
  };

  const handleSave = async () => {
    if (Object.keys(editedValues).length === 0) {
      setSuccessMessage('Nenhuma alteracao para salvar');
      setTimeout(() => setSuccessMessage(null), 3000);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ settings: editedValues }),
      });

      if (!response.ok) throw new Error('Failed to save settings');

      setSuccessMessage('Configuracoes salvas com sucesso!');
      setEditedValues({});
      await loadSettings();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Erro ao salvar configuracoes');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter settings by category and payment tab (if payment category is selected)
  const filteredSettings = settings.filter((s) => {
    if (s.category !== activeCategory) return false;
    if (activeCategory === 'payment') {
      return getPaymentTabForSetting(s.key) === activePaymentTab;
    }
    return true;
  });

  const renderSettingInput = (setting: Setting) => {
    const value = getDisplayValue(setting);
    const hasChanged = editedValues.hasOwnProperty(setting.key);

    switch (setting.type) {
      case 'BOOLEAN':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value === true || value === 'true'}
              onChange={(e) => handleValueChange(setting.key, e.target.checked)}
              className="sr-only peer"
            />
            <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500 ${hasChanged ? 'ring-2 ring-blue-400' : ''}`}></div>
          </label>
        );

      case 'NUMBER':
        return (
          <input
            type="number"
            step="0.01"
            value={value ?? ''}
            onChange={(e) => handleValueChange(setting.key, parseFloat(e.target.value) || 0)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${hasChanged ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}
          />
        );

      default:
        // Special handling for card_gateway setting
        if (setting.key === 'card_gateway') {
          return (
            <select
              value={value ?? 'both'}
              onChange={(e) => handleValueChange(setting.key, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${hasChanged ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}
            >
              <option value="both">Ambos (Stripe + Mercado Pago)</option>
              <option value="stripe">Apenas Stripe</option>
              <option value="mercadopago">Apenas Mercado Pago</option>
            </select>
          );
        }

        const isPassword = setting.key.includes('secret') || setting.key.includes('token') || setting.key.includes('key');
        const isVisible = visibleSecrets.has(setting.key);

        const toggleVisibility = () => {
          setVisibleSecrets(prev => {
            const newSet = new Set(prev);
            if (newSet.has(setting.key)) {
              newSet.delete(setting.key);
            } else {
              newSet.add(setting.key);
            }
            return newSet;
          });
        };

        return (
          <div className="relative">
            <input
              type={isPassword && !isVisible ? 'password' : 'text'}
              value={value ?? ''}
              onChange={(e) => handleValueChange(setting.key, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${hasChanged ? 'border-blue-400 bg-blue-50' : 'border-gray-300'} ${isPassword ? 'pr-10' : ''}`}
              placeholder={isPassword ? '••••••••' : ''}
            />
            {isPassword && (
              <button
                type="button"
                onClick={toggleVisibility}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                title={isVisible ? 'Ocultar' : 'Mostrar'}
              >
                {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            )}
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Configuracoes</h1>
              <p className="text-gray-600 mt-1">Gerencie as configuracoes da plataforma</p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving || Object.keys(editedValues).length === 0}
              className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 ${
                Object.keys(editedValues).length > 0
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar Alteracoes
                  {Object.keys(editedValues).length > 0 && (
                    <span className="bg-white text-orange-500 text-xs px-2 py-0.5 rounded-full">
                      {Object.keys(editedValues).length}
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      )}

      {successMessage && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Categories */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-gray-900">Categorias</h2>
              </div>
              <nav className="p-2">
                {categories.map((category) => (
                  <button
                    key={category.key}
                    onClick={() => setActiveCategory(category.key)}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                      activeCategory === category.key
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {(() => {
                      const IconComponent = categoryIcons[category.key] || FileText;
                      return <IconComponent className="h-5 w-5" />;
                    })()}
                    <span className="font-medium">{category.label}</span>
                  </button>
                ))}
              </nav>

              {/* Orphaned Settings Section */}
              {orphanedSettings.length > 0 && (
                <div className="border-t p-2">
                  <button
                    onClick={() => setShowOrphaned(!showOrphaned)}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                      showOrphaned
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'text-yellow-600 hover:bg-yellow-50'
                    }`}
                  >
                    <Archive className="h-5 w-5" />
                    <span className="font-medium">Legados</span>
                    <span className="ml-auto bg-yellow-200 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                      {orphanedSettings.length}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Settings */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  {showOrphaned ? (
                    <>
                      <Archive className="h-5 w-5 text-yellow-600" />
                      <span className="text-yellow-700">Configuracoes Legadas</span>
                    </>
                  ) : (
                    <>
                      {(() => {
                        const IconComponent = categoryIcons[activeCategory] || FileText;
                        return <IconComponent className="h-5 w-5" />;
                      })()}
                      {categories.find((c) => c.key === activeCategory)?.label || activeCategory}
                    </>
                  )}
                </h2>
              </div>

              {/* Payment Tabs - Only show for payment category when not showing orphaned */}
              {activeCategory === 'payment' && !showOrphaned && (
                <div className="border-b">
                  {/* Sub-tabs for payment providers */}
                  <div className="flex gap-1 p-2 bg-gray-50 overflow-x-auto">
                    {paymentTabs.map((tab) => {
                      const TabIcon = tab.icon;
                      const isActive = activePaymentTab === tab.key;
                      // Get status indicator for gateway tabs
                      let statusIndicator = null;
                      if (tab.key === 'stripe' && gatewayStatus) {
                        statusIndicator = gatewayStatus.stripe.configured && gatewayStatus.stripe.enabled ? (
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        ) : gatewayStatus.stripe.configured ? (
                          <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        );
                      } else if (tab.key === 'mercadopago' && gatewayStatus) {
                        statusIndicator = gatewayStatus.mercadopago.configured && gatewayStatus.mercadopago.enabled ? (
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        ) : gatewayStatus.mercadopago.configured ? (
                          <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        );
                      }
                      return (
                        <button
                          key={tab.key}
                          onClick={() => setActivePaymentTab(tab.key)}
                          className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium whitespace-nowrap transition-colors ${
                            isActive
                              ? 'bg-orange-500 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          <TabIcon className="h-4 w-4" />
                          {tab.label}
                          {statusIndicator}
                        </button>
                      );
                    })}
                  </div>

                  {/* Gateway Status Panel - Show for Stripe and Mercado Pago tabs */}
                  {(activePaymentTab === 'stripe' || activePaymentTab === 'mercadopago') && gatewayStatus && (
                    <div className="p-4 bg-gray-50 border-t">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">
                          Status do {activePaymentTab === 'stripe' ? 'Stripe' : 'Mercado Pago'}
                        </h3>
                        <button
                          onClick={reinitializeGateways}
                          disabled={isReinitializing}
                          className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                        >
                          {isReinitializing ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                              Reinicializando...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-3 w-3" />
                              Reinicializar
                            </>
                          )}
                        </button>
                      </div>
                      {activePaymentTab === 'stripe' && (
                        <div className={`p-3 rounded-lg border ${gatewayStatus.stripe.configured && gatewayStatus.stripe.enabled ? 'bg-green-50 border-green-200' : gatewayStatus.stripe.configured ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              {gatewayStatus.stripe.configured ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span>{gatewayStatus.stripe.configured ? 'Configurado' : 'Não configurado'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {gatewayStatus.stripe.enabled ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-gray-400" />
                              )}
                              <span>{gatewayStatus.stripe.enabled ? 'Habilitado' : 'Desabilitado'}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      {activePaymentTab === 'mercadopago' && (
                        <div className={`p-3 rounded-lg border ${gatewayStatus.mercadopago.configured && gatewayStatus.mercadopago.enabled ? 'bg-green-50 border-green-200' : gatewayStatus.mercadopago.configured ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              {gatewayStatus.mercadopago.configured ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span>{gatewayStatus.mercadopago.configured ? 'Configurado' : 'Não configurado'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {gatewayStatus.mercadopago.enabled ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-gray-400" />
                              )}
                              <span>{gatewayStatus.mercadopago.enabled ? 'Habilitado' : 'Desabilitado'}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        <AlertCircle className="inline h-3 w-3 mr-1" />
                        Após alterar as chaves, salve e reinicialize para aplicar.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="p-6 space-y-6">
                {!showOrphaned && filteredSettings.map((setting) => (
                  <div key={setting.id} className="flex items-start gap-4">
                    <div className="flex-1">
                      <label className="block font-medium text-gray-900 mb-1">
                        {setting.label || setting.key}
                        {!setting.isPublic && (
                          <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                            Privado
                          </span>
                        )}
                      </label>
                      {setting.description && (
                        <p className="text-sm text-gray-500 mb-2">{setting.description}</p>
                      )}
                      <div className="max-w-md">
                        {renderSettingInput(setting)}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Chave: <code className="bg-gray-100 px-1 rounded">{setting.key}</code>
                      </p>
                    </div>
                  </div>
                ))}

                {filteredSettings.length === 0 && !showOrphaned && (
                  <div className="text-center py-8 text-gray-500">
                    {activeCategory === 'payment' ? (
                      <>
                        Nenhuma configuracao disponivel para{' '}
                        {paymentTabs.find(t => t.key === activePaymentTab)?.label || activePaymentTab}
                      </>
                    ) : (
                      'Nenhuma configuracao nesta categoria'
                    )}
                  </div>
                )}

                {/* Orphaned Settings Panel */}
                {showOrphaned && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-yellow-700 mb-4">
                      <AlertCircle className="h-5 w-5" />
                      <p className="text-sm">
                        Estas configuracoes existem no banco de dados mas nao estao mais sendo utilizadas pelo sistema.
                        Voce pode remove-las com seguranca.
                      </p>
                    </div>
                    {orphanedSettings.map((setting) => (
                      <div key={setting.id} className="flex items-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{setting.label || setting.key}</span>
                            <code className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">{setting.key}</code>
                          </div>
                          {setting.description && (
                            <p className="text-sm text-gray-500 mt-1">{setting.description}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            Valor: <code className="bg-gray-100 px-1 rounded">{String(setting.parsedValue)}</code>
                          </p>
                        </div>
                        <button
                          onClick={() => deleteOrphanedSetting(setting.key)}
                          disabled={deletingKey === setting.key}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
                        >
                          {deletingKey === setting.key ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
