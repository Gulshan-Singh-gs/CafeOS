'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  ChefHat,
  BellRing,
  ShoppingBag,
  Sparkles,
  ArrowLeft,
  XCircle,
  Phone,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default function OrderTrackerPage({ params }: PageProps) {
  const { orderId } = use(params);

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isPolling, setIsPolling] = useState(false);

  // Status step configuration
  const statusSteps: { key: OrderStatus; label: string; desc: string; icon: React.ElementType }[] = [
    { key: 'received', label: 'Order Received', desc: 'Sent to kitchen display', icon: Clock },
    { key: 'preparing', label: 'In Kitchen', desc: 'Brewing & grilling hot', icon: ChefHat },
    { key: 'ready', label: 'Ready for Pickup / Table', desc: 'Fresh & ready to serve', icon: BellRing },
    { key: 'completed', label: 'Order Completed', desc: 'Served & enjoyed', icon: CheckCircle2 },
  ];

  const fetchOrder = async (silent = false) => {
    try {
      if (!silent) setIsPolling(true);
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) {
        throw new Error('Order not found or expired');
      }
      const data = await res.json();
      setOrder(data.order);
      setLastRefreshed(new Date());
      setError(null);
    } catch (err: unknown) {
      const e = err as Error;
      if (!silent) setError(e.message || 'Failed to load order');
    } finally {
      setIsLoading(false);
      setIsPolling(false);
    }
  };

  useEffect(() => {
    fetchOrder(false);

    // Auto-poll every 3.5 seconds to achieve real-time synchronization between owner and customer!
    const interval = setInterval(() => {
      fetchOrder(true);
    }, 3500);

    return () => clearInterval(interval);
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
        <div className="h-10 w-10 border-4 border-[#D9531E] border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-base font-bold text-[#1C130E]">Locating Your Order...</h2>
        <p className="text-xs text-stone-600 mt-1">Checking live kitchen status</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
        <XCircle className="h-12 w-12 text-stone-400 mb-3" />
        <h1 className="text-xl font-bold text-stone-900">Order Not Found</h1>
        <p className="text-xs text-stone-600 mt-1 max-w-sm">
          We could not find an active order with ID: &quot;{orderId}&quot;.
        </p>
        <Link
          href="/"
          className="mt-4 px-4 py-2 rounded-xl bg-[#1C130E] text-white text-xs font-bold hover:bg-[#D9531E] transition"
        >
          Return to Cafe Menu
        </Link>
      </div>
    );
  }

  const currentStepIdx = statusSteps.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-6 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/cafe/kurali-chai-bakehouse"
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-[#D9531E] transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Cafe Menu</span>
          </Link>

          <button
            onClick={() => fetchOrder(false)}
            className="flex items-center gap-1.5 text-[11px] font-medium text-stone-600 hover:text-stone-900 bg-white border border-[#E8DED1] px-2.5 py-1 rounded-full cursor-pointer transition shadow-2xs"
            title="Refresh order status"
          >
            <RefreshCw className={`h-3 w-3 ${isPolling ? 'animate-spin text-[#D9531E]' : ''}`} />
            <span>Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </button>
        </div>

        {/* Hero Card: Order Number & Live Status Badge */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DED1] shadow-md text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#D9531E] via-[#C89242] to-[#2E7D32]" />

          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-[#8C2E0A] mb-3">
            <Sparkles className="h-3.5 w-3.5 text-[#C89242]" />
            <span>Live Kitchen Tracker</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#1C130E] tracking-tight">
            Order #{order.order_number}
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Thank you, <span className="font-bold text-[#1C130E]">{order.customer_name}</span>! Your order is placed with Verma & Sons (Kurali).
          </p>

          {/* Current Status Pill Banner */}
          <div className="mt-5 inline-block">
            {isCancelled ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-sm">
                <XCircle className="h-4 w-4 text-rose-600" />
                This order was cancelled
              </span>
            ) : (
              <span
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm shadow-xs ${
                  order.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : order.status === 'ready'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                    : 'bg-[#F7F3EA] text-[#421E10] border border-[#E8DED1]'
                }`}
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D9531E] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D9531E]"></span>
                </span>
                <span>
                  Current Status:{' '}
                  <span className="capitalize">{order.status}</span>
                </span>
              </span>
            )}
          </div>

          {/* Stepper Progress Bar */}
          {!isCancelled && (
            <div className="mt-8 pt-6 border-t border-stone-100">
              <div className="grid grid-cols-4 gap-2 text-center">
                {statusSteps.map((step, idx) => {
                  const Icon = step.icon;
                  const isDone = currentStepIdx >= idx;
                  const isCurrent = currentStepIdx === idx;

                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div
                        className={`h-10 w-10 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                          isDone
                            ? 'bg-[#1C130E] text-[#C89242] shadow-sm'
                            : 'bg-stone-100 text-stone-600'
                        } ${isCurrent ? 'ring-4 ring-[#D9531E]/20 scale-105' : ''}`}
                      >
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <p
                        className={`text-[11px] sm:text-xs font-bold mt-2 leading-tight ${
                          isDone ? 'text-[#1C130E]' : 'text-stone-600'
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-[9px] text-stone-600 hidden sm:block mt-0.5">
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Order Details & Receipt */}
        <div className="bg-white rounded-3xl p-6 border border-[#E8DED1] shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[#1C130E] font-serif border-b border-stone-100 pb-3 flex items-center justify-between">
            <span>Order Summary</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 capitalize">
              {order.dining_option.replace('_', ' ')}
              {order.table_number ? ` • ${order.table_number}` : ''}
            </span>
          </h2>

          {/* Itemized Table */}
          <div className="divide-y divide-stone-100">
            {order.items?.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-semibold text-stone-900">
                    <span className="font-bold text-[#D9531E]">{item.quantity}x</span> {item.item_name}
                  </p>
                  {item.notes && (
                    <p className="text-xs text-stone-600 italic mt-0.5">Note: {item.notes}</p>
                  )}
                </div>
                <span className="font-bold text-stone-900 shrink-0">
                  ₹{item.subtotal}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-stone-800">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-[#2E7D32]">
              <span>Taxes & Packaging (Inclusive)</span>
              <span>₹{order.tax}</span>
            </div>
            <div className="flex justify-between text-base font-black text-[#1C130E] pt-2 border-t border-stone-200">
              <span>Total Bill (INR)</span>
              <span className="text-[#D9531E]">₹{order.total}</span>
            </div>
          </div>

          {/* Special Instructions Note if provided */}
          {order.special_instructions && (
            <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#EFE7D5] text-xs text-[#421E10]">
              <span className="font-bold">Kitchen Instructions:</span> {order.special_instructions}
            </div>
          )}

          {/* Customer Metadata */}
          <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs text-stone-600 gap-2">
            <div>
              <p>Customer: <span className="font-semibold text-stone-800">{order.customer_name}</span></p>
              <p>Phone: <span className="font-semibold text-stone-800">{order.customer_phone}</span></p>
            </div>
            <div className="text-right">
              <p>Placed at:</p>
              <p className="font-semibold text-stone-800">
                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>

        {/* Live Sync Notice */}
        <div className="text-center text-xs text-stone-600 space-y-1">
          <p>This tracking page continuously syncs with the barista at the counter.</p>
          <p className="text-[11px] text-stone-600">
            Keep this screen open or bookmark this link to verify your order number when picking up.
          </p>
        </div>
      </div>
    </div>
  );
}

