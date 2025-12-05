'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CreditCard, Banknote, QrCode, Loader2, Check, Copy, Clock } from 'lucide-react';
import api from '@/services/api';

type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'CASH';

interface Order {
  id: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentStatus: string;
  restaurant: {
    name: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    menuItem: {
      name: string;
    };
  }>;
}

interface PixData {
  pixQrCode: string;
  pixCode: string;
}

function CheckoutLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('PIX');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [copied, setCopied] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  // Poll for payment status when waiting for Pix
  useEffect(() => {
    if (!pixData || !orderId) return;

    const interval = setInterval(async () => {
      try {
        const response = await api.get<Order>(`/orders/${orderId}`);
        if (response.data.paymentStatus === 'PAID') {
          setPaymentSuccess(true);
          clearInterval(interval);
          setTimeout(() => {
            router.push(`/customer/orders/${orderId}`);
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [pixData, orderId, router]);

  const loadOrder = async () => {
    try {
      const response = await api.get<Order>(`/orders/${orderId}`);
      setOrder(response.data);

      if (response.data.paymentStatus === 'PAID') {
        setPaymentSuccess(true);
        setTimeout(() => {
          router.push(`/customer/orders/${orderId}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Error loading order:', error);
      router.push('/customer');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!orderId) return;

    setIsProcessing(true);

    try {
      if (selectedMethod === 'PIX') {
        const response = await api.post<PixData>(`/payments/pix/${orderId}`);
        setPixData({
          pixQrCode: response.data.pixQrCode,
          pixCode: response.data.pixCode,
        });
      } else if (selectedMethod === 'CASH') {
        await api.post('/payments/process', {
          orderId,
          method: 'CASH',
        });
        router.push(`/customer/orders/${orderId}`);
      } else {
        // For card payments, redirect to MercadoPago
        const response = await api.post<{ initPoint: string }>(`/payments/mercadopago/create-preference/${orderId}`);
        window.location.href = response.data.initPoint;
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyPixCode = () => {
    if (pixData?.pixCode) {
      navigator.clipboard.writeText(pixData.pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // For development: simulate payment confirmation
  const simulatePayment = async () => {
    try {
      await api.post(`/payments/simulate/${orderId}`);
      setPaymentSuccess(true);
      setTimeout(() => {
        router.push(`/customer/orders/${orderId}`);
      }, 2000);
    } catch (error) {
      console.error('Simulation error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Pedido nao encontrado</p>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-green-50 p-4">
        <div className="rounded-full bg-green-500 p-4">
          <Check className="h-12 w-12 text-white" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-green-700">Pagamento Confirmado!</h1>
        <p className="mt-2 text-green-600">Redirecionando para seu pedido...</p>
      </div>
    );
  }

  // Show Pix QR Code
  if (pixData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white px-4 py-4 shadow-sm">
          <button
            onClick={() => setPixData(null)}
            className="flex items-center gap-2 text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
            Voltar
          </button>
        </header>

        <main className="mx-auto max-w-md p-4">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <QrCode className="h-8 w-8 text-orange-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Pague com Pix</h1>
              <p className="mt-1 text-gray-500">Escaneie o QR Code ou copie o codigo</p>
            </div>

            {/* QR Code */}
            <div className="mt-6 flex justify-center">
              {pixData.pixQrCode && (
                <img
                  src={pixData.pixQrCode}
                  alt="Pix QR Code"
                  className="h-64 w-64 rounded-lg border"
                />
              )}
            </div>

            {/* Copy Code */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Codigo Pix Copia e Cola
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pixData.pixCode || ''}
                  readOnly
                  className="flex-1 truncate rounded-lg border bg-gray-50 px-3 py-2 text-sm"
                />
                <button
                  onClick={copyPixCode}
                  className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Timer */}
            <div className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-yellow-50 p-3 text-yellow-700">
              <Clock className="h-5 w-5" />
              <span className="text-sm">O codigo expira em 30 minutos</span>
            </div>

            {/* Amount */}
            <div className="mt-6 rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-sm text-gray-500">Valor a pagar</p>
              <p className="text-3xl font-bold text-gray-900">
                R$ {Number(order.total).toFixed(2)}
              </p>
            </div>

            {/* Status */}
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Aguardando pagamento...</span>
              </div>
            </div>

            {/* Dev: Simulate Payment */}
            {process.env.NODE_ENV !== 'production' && (
              <div className="mt-4 border-t pt-4">
                <button
                  onClick={simulatePayment}
                  className="w-full rounded-lg border border-green-500 py-2 text-sm font-medium text-green-600 hover:bg-green-50"
                >
                  [DEV] Simular Pagamento
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white px-4 py-4 shadow-sm">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
          Voltar
        </button>
      </header>

      <main className="mx-auto max-w-md p-4">
        {/* Order Summary */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-gray-900">Resumo do Pedido</h2>
          <p className="text-sm text-gray-500">{order.restaurant.name}</p>

          <div className="mt-4 space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantity}x {item.menuItem.name}
                </span>
                <span className="text-gray-900">
                  R$ {(Number(item.unitPrice) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">R$ {Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Taxa de entrega</span>
              <span className="text-gray-900">R$ {Number(order.deliveryFee).toFixed(2)}</span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Desconto</span>
                <span className="text-green-600">-R$ {Number(order.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-lg text-orange-500">
                R$ {Number(order.total).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-gray-900">Forma de Pagamento</h2>

          <div className="mt-4 space-y-3">
            {/* Pix */}
            <button
              onClick={() => setSelectedMethod('PIX')}
              className={`flex w-full items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
                selectedMethod === 'PIX'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`rounded-lg p-2 ${
                selectedMethod === 'PIX' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                <QrCode className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Pix</p>
                <p className="text-sm text-gray-500">Pagamento instantaneo</p>
              </div>
              {selectedMethod === 'PIX' && (
                <div className="rounded-full bg-orange-500 p-1">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </button>

            {/* Credit Card */}
            <button
              onClick={() => setSelectedMethod('CREDIT_CARD')}
              className={`flex w-full items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
                selectedMethod === 'CREDIT_CARD'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`rounded-lg p-2 ${
                selectedMethod === 'CREDIT_CARD' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Cartao de Credito</p>
                <p className="text-sm text-gray-500">Parcele em ate 12x</p>
              </div>
              {selectedMethod === 'CREDIT_CARD' && (
                <div className="rounded-full bg-orange-500 p-1">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </button>

            {/* Debit Card */}
            <button
              onClick={() => setSelectedMethod('DEBIT_CARD')}
              className={`flex w-full items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
                selectedMethod === 'DEBIT_CARD'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`rounded-lg p-2 ${
                selectedMethod === 'DEBIT_CARD' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Cartao de Debito</p>
                <p className="text-sm text-gray-500">Debito automatico</p>
              </div>
              {selectedMethod === 'DEBIT_CARD' && (
                <div className="rounded-full bg-orange-500 p-1">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </button>

            {/* Cash */}
            <button
              onClick={() => setSelectedMethod('CASH')}
              className={`flex w-full items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
                selectedMethod === 'CASH'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`rounded-lg p-2 ${
                selectedMethod === 'CASH' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                <Banknote className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Dinheiro</p>
                <p className="text-sm text-gray-500">Pague na entrega</p>
              </div>
              {selectedMethod === 'CASH' && (
                <div className="rounded-full bg-orange-500 p-1">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="mt-4 w-full rounded-xl bg-orange-500 py-4 font-semibold text-white hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              {selectedMethod === 'PIX' && 'Gerar QR Code Pix'}
              {selectedMethod === 'CREDIT_CARD' && 'Pagar com Cartao de Credito'}
              {selectedMethod === 'DEBIT_CARD' && 'Pagar com Cartao de Debito'}
              {selectedMethod === 'CASH' && 'Confirmar Pagamento na Entrega'}
            </>
          )}
        </button>
      </main>
    </div>
  );
}
