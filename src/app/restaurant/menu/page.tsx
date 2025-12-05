'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, MoreVertical, X, UtensilsCrossed } from 'lucide-react';
import api from '@/services/api';
import { ImageUpload } from '@/components/ImageUpload';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  items: MenuItem[];
}

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    isAvailable: true,
    image: '',
  });
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const response = await api.get<Category[]>('/restaurants/my/menu-categories');
      const menuCategories = response.data;
      setCategories(menuCategories);
      if (menuCategories.length > 0 && !activeCategory) {
        setActiveCategory(menuCategories[0].id);
      }
    } catch (error) {
      console.error('Error loading menu:', error);
      // Mock data for now
      setCategories([
        {
          id: '1',
          name: 'Lanches',
          items: [
            { id: '1', name: 'X-Burger', description: 'Hambúrguer, queijo, alface, tomate', price: 25.90, isAvailable: true, categoryId: '1' },
            { id: '2', name: 'X-Salada', description: 'Hambúrguer, queijo, alface, tomate, cebola', price: 27.90, isAvailable: true, categoryId: '1' },
          ],
        },
        {
          id: '2',
          name: 'Bebidas',
          items: [
            { id: '3', name: 'Coca-Cola 350ml', description: 'Refrigerante', price: 6.00, isAvailable: true, categoryId: '2' },
            { id: '4', name: 'Suco Natural', description: 'Laranja, limão ou maracujá', price: 8.00, isAvailable: false, categoryId: '2' },
          ],
        },
        {
          id: '3',
          name: 'Acompanhamentos',
          items: [
            { id: '5', name: 'Batata Frita', description: 'Porção 300g', price: 15.00, isAvailable: true, categoryId: '3' },
          ],
        },
      ]);
      setActiveCategory('1');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAvailability = async (categoryId: string, itemId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId
                  ? { ...item, isAvailable: !item.isAvailable }
                  : item
              ),
            }
          : cat
      )
    );

    try {
      await api.patch(`/restaurants/my/menu-items/${itemId}/toggle`);
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      categoryId: activeCategory,
      isAvailable: true,
      image: '',
    });
    setShowModal(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      categoryId: item.categoryId,
      isAvailable: item.isAvailable,
      image: item.image || '',
    });
    setShowModal(true);
  };

  const handleSaveItem = async () => {
    try {
      const itemData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        isAvailable: formData.isAvailable,
        image: formData.image || null,
      };

      if (editingItem) {
        await api.patch(`/restaurants/my/menu-items/${editingItem.id}`, itemData);
      } else {
        await api.post('/restaurants/my/menu-items', itemData);
      }

      setShowModal(false);
      loadMenu();
    } catch (error) {
      console.error('Error saving item:', error);
      // For now, just update locally
      if (editingItem) {
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            items: cat.items.map((item) =>
              item.id === editingItem.id
                ? { ...item, ...formData, price: parseFloat(formData.price) }
                : item
            ),
          }))
        );
      } else {
        const newItem: MenuItem = {
          id: Date.now().toString(),
          ...formData,
          price: parseFloat(formData.price),
        };
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === formData.categoryId
              ? { ...cat, items: [...cat.items, newItem] }
              : cat
          )
        );
      }
      setShowModal(false);
    }
  };

  const handleDeleteItem = async (categoryId: string, itemId: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      await api.delete(`/restaurants/my/menu-items/${itemId}`);
      loadMenu();
    } catch (error) {
      console.error('Error deleting item:', error);
      // Update locally
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? { ...cat, items: cat.items.filter((item) => item.id !== itemId) }
            : cat
        )
      );
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      await api.post('/restaurants/my/menu-categories', { name: newCategoryName });
      loadMenu();
    } catch (error) {
      console.error('Error adding category:', error);
      // Add locally
      const newCategory: Category = {
        id: Date.now().toString(),
        name: newCategoryName,
        items: [],
      };
      setCategories((prev) => [...prev, newCategory]);
    }
    setNewCategoryName('');
    setShowCategoryModal(false);
  };

  const activeItems = categories.find((c) => c.id === activeCategory)?.items || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cardápio</h1>
          <p className="text-gray-500">Gerencie os itens do seu cardápio</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          Novo Item
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeCategory === category.id
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {category.name}
          </button>
        ))}
        <button
          onClick={() => setShowCategoryModal(true)}
          className="flex items-center gap-1 px-3 py-3 text-sm text-gray-400 hover:text-gray-600"
        >
          <Plus className="h-4 w-4" />
          Categoria
        </button>
      </div>

      {/* Items Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {activeItems.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-xl border bg-white">
            {/* Image placeholder */}
            <div className="relative h-40 bg-gray-100">
              {item.image ? (
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <UtensilsCrossed className="h-12 w-12 text-gray-400" />
                </div>
              )}
              {!item.isAvailable && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <span className="rounded bg-gray-800 px-3 py-1 text-sm text-white">
                    Indisponível
                  </span>
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">{item.description}</p>
                  <p className="mt-2 text-lg font-bold text-orange-500">
                    R$ {Number(item.price || 0).toFixed(2)}
                  </p>
                </div>

                {/* Dropdown Menu */}
                <div className="relative group">
                  <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  <div className="absolute right-0 top-full z-10 hidden w-32 rounded-lg border bg-white py-1 shadow-lg group-hover:block">
                    <button
                      onClick={() => openEditModal(item)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteItem(activeCategory, item.id)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>

              {/* Availability Toggle */}
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <span className="text-sm text-gray-500">
                  {item.isAvailable ? 'Disponível' : 'Indisponível'}
                </span>
                <button
                  onClick={() => toggleAvailability(activeCategory, item.id)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    item.isAvailable ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      item.isAvailable ? 'left-5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Item Card */}
        <button
          onClick={openAddModal}
          className="flex h-full min-h-[300px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white transition-colors hover:border-orange-300 hover:bg-orange-50"
        >
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Plus className="h-6 w-6 text-gray-400" />
            </div>
            <p className="mt-2 font-medium text-gray-900">Adicionar Item</p>
            <p className="text-sm text-gray-500">Clique para adicionar</p>
          </div>
        </button>
      </div>

      {/* Add/Edit Item Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingItem ? 'Editar Item' : 'Novo Item'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Imagem
                </label>
                <ImageUpload
                  currentImage={formData.image}
                  onUpload={(url) => setFormData({ ...formData, image: url })}
                  uploadEndpoint="menu-item"
                  aspectRatio="square"
                  className="h-40"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:outline-none"
                  placeholder="Ex: X-Burger"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:outline-none"
                  rows={2}
                  placeholder="Ingredientes e detalhes"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Preço *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full rounded-lg border py-2 pl-10 pr-3 focus:border-orange-500 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Categoria *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Disponível</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isAvailable: !formData.isAvailable })}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    formData.isAvailable ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      formData.isAvailable ? 'left-5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-lg border py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveItem}
                className="flex-1 rounded-lg bg-orange-500 py-2.5 text-sm font-medium text-white hover:bg-orange-600"
              >
                {editingItem ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Nova Categoria</h2>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nome da Categoria
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:outline-none"
                placeholder="Ex: Sobremesas"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="flex-1 rounded-lg border py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddCategory}
                className="flex-1 rounded-lg bg-orange-500 py-2.5 text-sm font-medium text-white hover:bg-orange-600"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
