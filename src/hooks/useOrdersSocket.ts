'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// Base URL for WebSocket connection (without /api)
const WS_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace('/api', '');

interface OrderStatusUpdate {
  orderId: string;
  status: string;
  order: any;
}

interface UseOrdersSocketOptions {
  restaurantId?: string;
  onNewOrder?: (order: any) => void;
  onOrderStatusUpdate?: (data: OrderStatusUpdate) => void;
}

export function useOrdersSocket({
  restaurantId,
  onNewOrder,
  onOrderStatusUpdate,
}: UseOrdersSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const joinedRestaurantRef = useRef<string | null>(null);

  // Store callbacks in refs to avoid recreating socket on callback changes
  const onNewOrderRef = useRef(onNewOrder);
  const onOrderStatusUpdateRef = useRef(onOrderStatusUpdate);

  useEffect(() => {
    onNewOrderRef.current = onNewOrder;
  }, [onNewOrder]);

  useEffect(() => {
    onOrderStatusUpdateRef.current = onOrderStatusUpdate;
  }, [onOrderStatusUpdate]);

  // Create socket connection once
  useEffect(() => {
    console.log('Creating WebSocket connection to:', WS_URL);

    const socket = io(WS_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('WebSocket connected, socket id:', socket.id);

      // Join restaurant room if restaurantId is available
      if (restaurantId && joinedRestaurantRef.current !== restaurantId) {
        console.log('Joining restaurant room:', restaurantId);
        socket.emit('joinRestaurant', restaurantId);
        joinedRestaurantRef.current = restaurantId;
      }
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      joinedRestaurantRef.current = null;
    });

    // Listen for new orders
    socket.on('newOrder', (data: { order: any }) => {
      console.log('New order received via WebSocket:', data.order?.id);
      onNewOrderRef.current?.(data.order);
    });

    // Listen for order status updates
    socket.on('orderStatusUpdate', (data: OrderStatusUpdate) => {
      console.log('Order status update via WebSocket:', data.orderId, data.status);
      onOrderStatusUpdateRef.current?.(data);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message);
    });

    // Cleanup on unmount
    return () => {
      console.log('Disconnecting WebSocket');
      socket.disconnect();
    };
  }, []); // Only create socket once

  // Join restaurant room when restaurantId changes
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !restaurantId) return;

    if (socket.connected && joinedRestaurantRef.current !== restaurantId) {
      console.log('Joining restaurant room (after connect):', restaurantId);
      socket.emit('joinRestaurant', restaurantId);
      joinedRestaurantRef.current = restaurantId;
    }
  }, [restaurantId]);

  const joinOrder = useCallback((orderId: string) => {
    socketRef.current?.emit('joinOrder', orderId);
  }, []);

  const leaveOrder = useCallback((orderId: string) => {
    socketRef.current?.emit('leaveOrder', orderId);
  }, []);

  return {
    socket: socketRef.current,
    joinOrder,
    leaveOrder,
  };
}
