'use client';

import { useEffect, useState, useCallback } from 'react';
import { Clock, MapPin, CreditCard, Phone, Check, X, Bell, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';
import { useOrdersSocket } from '@/hooks/useOrdersSocket';
import { useNotificationSound } from '@/hooks/useNotificationSound';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
  menuItem: {
    name: string;
  };
}

interface Order {
  id: string;
  status: string;
  total: number;
  deliveryFee: number;
  paymentMethod: string;
  notes?: string;
  driverId?: string;
  items: OrderItem[];
  customer: {
    fullName: string;
  };
  deliveryAddress: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
  };
  createdAt: string;
}

type TabType = 'pending' | 'preparing' | 'ready' | 'delivering' | 'history';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | undefined>();
  const { playSound, stopSound } = useNotificationSound();

  // Handle new order from WebSocket
  const handleNewOrder = useCallback((order: Order) => {
    setOrders((prev) => {
      // Check if order already exists
      if (prev.some((o) => o.id === order.id)) {
        return prev;
      }
      // Add new order to the beginning
      return [order, ...prev];
    });

    // Play notification sound (repeats 3 times)
    playSound({ volume: 0.8, loop: true, loopCount: 3 });

    // Show toast notification
    toast.success('Novo pedido recebido!', {
      description: `Pedido #${order.id.slice(-6).toUpperCase()} - ${order.customer?.fullName || 'Cliente'}`,
      duration: 10000,
      action: {
        label: 'Ver pedido',
        onClick: () => setActiveTab('pending'),
      },
    });
  }, [playSound]);

  // Handle order status update from WebSocket
  const handleOrderStatusUpdate = useCallback(
    (data: { orderId: string; status: string; order: Order }) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === data.orderId
            ? { ...o, status: data.status, driverId: data.order?.driverId }
            : o
        )
      );
    },
    []
  );

  // Connect to WebSocket
  useOrdersSocket({
    restaurantId,
    onNewOrder: handleNewOrder,
    onOrderStatusUpdate: handleOrderStatusUpdate,
  });

  useEffect(() => {
    loadRestaurantProfile();
    loadOrders();
  }, []);

  const loadRestaurantProfile = async () => {
    try {
      const response = await api.get<{ id: string }>('/restaurants/my/profile');
      console.log('Restaurant profile loaded, ID:', response.data.id);
      setRestaurantId(response.data.id);
    } catch (error) {
      console.error('Error loading restaurant profile:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await api.get<Order[]>('/restaurants/my/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set());

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    // Prevent duplicate calls
    if (updatingOrders.has(orderId)) return;

    // Check if order already has this status
    const order = orders.find((o) => o.id === orderId);
    if (order?.status === newStatus) return;

    setUpdatingOrders((prev) => new Set(prev).add(orderId));
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      // Note: WebSocket will update the order status automatically
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setUpdatingOrders((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const preparingOrders = orders.filter((o) =>
    o.status === 'CONFIRMED' || o.status === 'PREPARING'
  );
  const readyOrders = orders.filter((o) => o.status === 'READY');
  const deliveringOrders = orders.filter((o) =>
    o.status === 'PICKED_UP' || o.status === 'IN_TRANSIT' || o.status === 'OUT_FOR_DELIVERY'
  );
  const historyOrders = orders.filter((o) =>
    o.status === 'DELIVERED' || o.status === 'CANCELLED'
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `há ${diffMins} min`;
    const hours = Math.floor(diffMins / 60);
    return `há ${hours}h`;
  };

  const formatAddress = (address: Order['deliveryAddress']) => {
    if (!address) return 'Endereço não informado';
    return `${address.street}, ${address.number} - ${address.neighborhood}, ${address.city}`;
  };

  const tabs = [
    { id: 'pending' as TabType, label: 'Novos', count: pendingOrders.length },
    { id: 'preparing' as TabType, label: 'Preparando', count: preparingOrders.length },
    { id: 'ready' as TabType, label: 'Prontos', count: readyOrders.length },
    { id: 'delivering' as TabType, label: 'Em Entrega', count: deliveringOrders.length },
    { id: 'history' as TabType, label: 'Histórico', count: null },
  ];

  const getOrdersForTab = () => {
    switch (activeTab) {
      case 'pending':
        return pendingOrders;
      case 'preparing':
        return preparingOrders;
      case 'ready':
        return readyOrders;
      case 'delivering':
        return deliveringOrders;
      case 'history':
        return historyOrders;
      default:
        return [];
    }
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const statusColors = {
      PENDING: 'bg-yellow-500',
      CONFIRMED: 'bg-blue-500',
      PREPARING: 'bg-blue-500',
      READY: 'bg-green-500',
      PICKED_UP: 'bg-purple-500',
      IN_TRANSIT: 'bg-purple-500',
      OUT_FOR_DELIVERY: 'bg-purple-500',
      DELIVERED: 'bg-green-600',
      CANCELLED: 'bg-red-500',
    };

    const statusLabel = {
      PENDING: 'Novo',
      CONFIRMED: 'Confirmado',
      PREPARING: 'Preparando',
      READY: 'Pronto',
      PICKED_UP: 'Retirado',
      IN_TRANSIT: 'Em trânsito',
      OUT_FOR_DELIVERY: 'Em entrega',
      DELIVERED: 'Entregue',
      CANCELLED: 'Cancelado',
    };

    return (
      <div className="rounded-xl border bg-white overflow-hidden">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                Pedido #{order.id.slice(-6).toUpperCase()}
              </h3>
              <p className="text-sm text-gray-500">{formatTime(order.createdAt)}</p>
            </div>
            <span className="rounded-full border px-3 py-1 text-sm flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${statusColors[order.status as keyof typeof statusColors] || 'bg-gray-400'}`} />
              {statusLabel[order.status as keyof typeof statusLabel] || order.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Customer */}
          <div className="text-sm font-medium text-gray-900">
            {order.customer?.fullName || 'Cliente'}
          </div>

          {/* Address */}
          <div className="flex items-start gap-2 text-sm text-gray-500">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{formatAddress(order.deliveryAddress)}</span>
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Items */}
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div>
                  <span className="font-medium text-gray-900">
                    {item.quantity}x {item.menuItem?.name || 'Item'}
                  </span>
                  {item.notes && (
                    <p className="text-xs text-gray-500">• {item.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Payment & Total */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CreditCard className="h-4 w-4" />
              <span>{order.paymentMethod || 'Cartão'}</span>
            </div>
            <span className="text-lg font-bold text-gray-900">
              R$ {Number(order.total || 0).toFixed(2)}
            </span>
          </div>

          {/* Actions */}
          {order.status === 'PENDING' && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                disabled={updatingOrders.has(order.id)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-4 w-4" />
                Recusar
              </button>
              <button
                onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                disabled={updatingOrders.has(order.id)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 py-2.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="h-4 w-4" />
                {updatingOrders.has(order.id) ? 'Processando...' : 'Aceitar'}
              </button>
            </div>
          )}

          {(order.status === 'CONFIRMED' || order.status === 'PREPARING') && (
            <button
              onClick={() => updateOrderStatus(order.id, 'READY')}
              disabled={updatingOrders.has(order.id)}
              className="w-full rounded-lg bg-orange-500 py-2.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updatingOrders.has(order.id) ? 'Processando...' : 'Marcar como Pronto'}
            </button>
          )}

          {order.status === 'READY' && !order.driverId && (
            <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-50 border border-yellow-200 py-2.5 text-sm font-medium text-yellow-700">
              <Bell className="h-4 w-4 animate-pulse" />
              Aguardando entregador aceitar
            </div>
          )}

          {order.status === 'READY' && order.driverId && (
            <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-50 border border-green-200 py-2.5 text-sm font-medium text-green-700">
              <Check className="h-4 w-4" />
              Entregador a caminho
            </div>
          )}
        </div>
      </div>
    );
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-gray-500">Gerencie os pedidos do seu restaurante</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white'
                    : tab.id === 'pending'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {getOrdersForTab().length === 0 ? (
          <div className="col-span-2 py-12 text-center text-gray-500">
            {activeTab === 'pending' && 'Nenhum pedido novo no momento'}
            {activeTab === 'preparing' && 'Nenhum pedido em preparo'}
            {activeTab === 'ready' && 'Nenhum pedido pronto'}
            {activeTab === 'delivering' && 'Nenhum pedido em entrega'}
            {activeTab === 'history' && 'Nenhum pedido no histórico'}
          </div>
        ) : (
          getOrdersForTab().map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </div>
  );
}
