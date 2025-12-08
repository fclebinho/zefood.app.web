'use client';

import { useState, useEffect } from 'react';
import { Truck, Banknote, CreditCard, Package, Settings, FileText, Save } from 'lucide-react';

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
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});

  useEffect(() => {
    loadSettings();
    loadCategories();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings/categories`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`, {
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

  const filteredSettings = settings.filter((s) => s.category === activeCategory);

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
        return (
          <input
            type={isPassword ? 'password' : 'text'}
            value={value ?? ''}
            onChange={(e) => handleValueChange(setting.key, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${hasChanged ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}
            placeholder={isPassword ? '••••••••' : ''}
          />
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
            </div>
          </div>

          {/* Main Content - Settings */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  {(() => {
                    const IconComponent = categoryIcons[activeCategory] || FileText;
                    return <IconComponent className="h-5 w-5" />;
                  })()}
                  {categories.find((c) => c.key === activeCategory)?.label || activeCategory}
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {filteredSettings.map((setting) => (
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

                {filteredSettings.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma configuracao nesta categoria
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
