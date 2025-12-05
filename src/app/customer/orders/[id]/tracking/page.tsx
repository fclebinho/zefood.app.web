'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { AlertTriangle, User, Phone, Check } from 'lucide-react';

declare global {
  interface Window {
    google: typeof google;
  }
  const google: {
    maps: {
      Map: new (element: HTMLElement, options: any) => any;
      Marker: new (options: any) => any;
      SymbolPath: {
        FORWARD_CLOSED_ARROW: number;
      };
    };
  };
}

interface DriverLocation {
  driverId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: Date;
}

interface TrackingData {
  orderId: string;
  status: string;
  driver: {
    id: string;
    name: string;
    phone?: string;
    vehicleType?: string;
    vehiclePlate?: string;
    location: {
      latitude: number;
      longitude: number;
      lastUpdate: Date;
    } | null;
  } | null;
  restaurant: {
    id: string;
    name: string;
    address: string;
  };
  deliveryAddress: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  } | null;
  estimatedDelivery?: Date;
}

const statusLabels: Record<string, string> = {
  PENDING: 'Aguardando confirmacao',
  CONFIRMED: 'Pedido confirmado',
  PREPARING: 'Preparando seu pedido',
  READY: 'Pronto para retirada',
  PICKED_UP: 'Entregador retirou o pedido',
  IN_TRANSIT: 'Pedido a caminho',
  OUT_FOR_DELIVERY: 'Saiu para entrega',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
};

const statusSteps = [
  'CONFIRMED',
  'PREPARING',
  'READY',
  'PICKED_UP',
  'IN_TRANSIT',
  'DELIVERED',
];

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!orderId) return;

    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    socketRef.current = io(`${apiUrl}/tracking`, {
      transports: ['websocket'],
      auth: { token },
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      setError(null);
      socketRef.current?.emit('subscribeToOrder', orderId);
      socketRef.current?.emit('getOrderTracking', orderId);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    socketRef.current.on('error', (err: any) => {
      setError('Erro de conexao');
      console.error('Socket error:', err);
    });

    socketRef.current.on('driverLocation', (data: DriverLocation & { orderId: string }) => {
      if (data.orderId === orderId) {
        setDriverLocation({
          driverId: data.driverId,
          latitude: data.latitude,
          longitude: data.longitude,
          heading: data.heading,
          speed: data.speed,
          timestamp: new Date(data.timestamp),
        });
      }
    });

    socketRef.current.on('orderTracking', (data: { data: TrackingData }) => {
      if (data.data) {
        setTrackingData(data.data);
        if (data.data.driver?.location) {
          setDriverLocation({
            driverId: data.data.driver.id,
            latitude: data.data.driver.location.latitude,
            longitude: data.data.driver.location.longitude,
            timestamp: new Date(data.data.driver.location.lastUpdate),
          });
        }
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('unsubscribeFromOrder', orderId);
        socketRef.current.disconnect();
      }
    };
  }, [orderId]);

  // Initialize Google Map
  useEffect(() => {
    if (!driverLocation || !mapRef.current) return;

    const initMap = async () => {
      if (!window.google) {
        // Load Google Maps script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`;
        script.async = true;
        script.onload = () => createMap();
        document.head.appendChild(script);
      } else {
        createMap();
      }
    };

    const createMap = () => {
      if (!mapRef.current || !driverLocation) return;

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: { lat: driverLocation.latitude, lng: driverLocation.longitude },
          zoom: 15,
          disableDefaultUI: true,
          zoomControl: true,
        });
      }

      if (!markerRef.current) {
        markerRef.current = new google.maps.Marker({
          position: { lat: driverLocation.latitude, lng: driverLocation.longitude },
          map: mapInstanceRef.current,
          title: 'Entregador',
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: '#f97316',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
            rotation: driverLocation.heading || 0,
          },
        });
      } else {
        markerRef.current.setPosition({
          lat: driverLocation.latitude,
          lng: driverLocation.longitude,
        });
        if (driverLocation.heading) {
          const icon = markerRef.current.getIcon() as any;
          icon.rotation = driverLocation.heading;
          markerRef.current.setIcon(icon);
        }
      }

      mapInstanceRef.current.panTo({
        lat: driverLocation.latitude,
        lng: driverLocation.longitude,
      });
    };

    initMap();
  }, [driverLocation]);

  const getCurrentStep = () => {
    if (!trackingData) return 0;
    const index = statusSteps.indexOf(trackingData.status);
    return index >= 0 ? index : 0;
  };

  const formatAddress = (address: any) => {
    if (!address) return 'Endereco nao disponivel';
    return `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ''}, ${address.neighborhood}`;
  };

  const showMap = trackingData?.status &&
    ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(trackingData.status) &&
    driverLocation;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-yellow-500" />
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Carregando rastreamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Status Header */}
      <div className="bg-orange-500 text-white p-6 text-center">
        <h1 className="text-2xl font-bold">{statusLabels[trackingData.status]}</h1>
        {!isConnected && (
          <div className="mt-2 inline-block bg-white/20 px-3 py-1 rounded-full text-sm">
            Reconectando...
          </div>
        )}
      </div>

      {/* Progress Steps */}
      <div className="bg-white p-6 shadow-sm">
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          {statusSteps.map((status, index) => {
            const currentStep = getCurrentStep();
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <div key={status} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                    ${isCurrent ? 'bg-orange-500 text-white' : ''}
                    ${!isCompleted && !isCurrent ? 'bg-gray-200 text-gray-500' : ''}
                  `}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                {index < statusSteps.length - 1 && (
                  <div
                    className={`w-8 h-1 mx-1
                      ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                    `}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Map */}
        {showMap && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div ref={mapRef} className="h-64 w-full" />
            {driverLocation && (
              <div className="p-2 bg-gray-800 text-white text-sm text-center">
                Ultima atualizacao: {new Date(driverLocation.timestamp).toLocaleTimeString('pt-BR')}
              </div>
            )}
          </div>
        )}

        {/* Driver Info */}
        {trackingData.driver && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Entregador</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{trackingData.driver.name}</p>
                  {trackingData.driver.vehicleType && (
                    <p className="text-sm text-gray-500">
                      {trackingData.driver.vehicleType} - {trackingData.driver.vehiclePlate}
                    </p>
                  )}
                </div>
              </div>
              {trackingData.driver.phone && (
                <a
                  href={`tel:${trackingData.driver.phone}`}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" /> Ligar
                </a>
              )}
            </div>
          </div>
        )}

        {/* Restaurant Info */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Restaurante</h2>
          <p className="font-semibold text-gray-900">{trackingData.restaurant.name}</p>
          <p className="text-gray-600">{trackingData.restaurant.address}</p>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Endereco de Entrega</h2>
          <p className="text-gray-600">{formatAddress(trackingData.deliveryAddress)}</p>
        </div>

        {/* Order Number */}
        <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
          <span className="text-gray-600">Pedido</span>
          <span className="font-bold text-orange-500">#{orderId.slice(-6).toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}
