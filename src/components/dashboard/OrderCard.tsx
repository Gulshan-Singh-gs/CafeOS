'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  BellRing,
  XCircle,
  ExternalLink,
  Phone,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}

export function OrderCard({ order, onUpdateStatus }: OrderCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (nextStatus: OrderStatus) => {
    try {
      setIsUpdating(true);
      await onUpdateStatus(order.id, nextStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = () => {
    switch (order.status) {
      case 'received':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
            <Clock className="h-3.5 w-3.5" />
            <span>New Order</span>
          </span>
        );
      case 'preparing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-[#8C2E0A] border border-amber-300 text-xs font-bold">
            <ChefHat className="h-3.5 w-3.5 text-[#D9531E]" />
            <span>Preparing in Kitchen</span>
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold animate-pulse">
            <BellRing className="h-3.5 w-3.5" />
            <span>Ready to Serve</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-xs font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Completed</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
            <XCircle className="h-3.5 w-3.5" />
            <span>Cancelled</span>
          </span>
        );
    }
  };

  const elapsedMinutes = Math.floor(
    (Date.now() - new Date(order.created_at).getTime()) / 60000
  );

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-all duration-200 bg-white ${
        order.status === 'received'
          ? 'border-blue-300 shadow-md ring-2 ring-blue-100'
          : order.status === 'ready'
          ? 'border-emerald-300 shadow-sm'
          : 'border-[#E8DED1] shadow-2xs'
      }`}
    >
      {/* Top Header: Order Number, Time, Status */}
      <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-black text-[#1C130E] tracking-tight">
              Order #{order.order_number}
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
              {order.dining_option.replace('_', ' ')}
              {order.table_number ? ` • ${order.table_number}` : ''}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-stone-600 mt-1">
            <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>•</span>
            <span className="font-semibold text-stone-700">
              {elapsedMinutes === 0 ? 'Just now' : `${elapsedMinutes}m ago`}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          {getStatusBadge()}
          <Link
            href={`/order/${order.id}`}
            target="_blank"
            className="text-[11px] text-stone-600 hover:text-[#D9531E] flex items-center gap-1 transition"
            title="Open customer live tracker view"
          >
            <span>Customer View</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Customer Info */}
      <div className="py-2.5 flex flex-wrap items-center justify-between text-xs text-stone-700 border-b border-stone-100">
        <span className="font-bold text-[#1C130E]">{order.customer_name}</span>
        <a
          href={`tel:${order.customer_phone}`}
          className="flex items-center gap-1 text-[#D9531E] hover:underline font-semibold"
        >
          <Phone className="h-3 w-3" />
          <span>{order.customer_phone}</span>
        </a>
      </div>

      {/* Item List */}
      <div className="py-3 space-y-1.5">
        {order.items?.map((item) => (
          <div key={item.id} className="flex justify-between items-start text-xs sm:text-sm">
            <div>
              <span className="font-black text-[#D9531E] mr-1.5">{item.quantity}x</span>
              <span className="font-medium text-stone-800">{item.item_name}</span>
              {item.notes && (
                <p className="text-[11px] text-stone-600 italic ml-5">↳ Note: {item.notes}</p>
              )}
            </div>
            <span className="font-bold text-stone-900 shrink-0">₹{item.subtotal}</span>
          </div>
        ))}
      </div>

      {/* Special Kitchen Notes */}
      {order.special_instructions && (
        <div className="mb-3 p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-[#8C2E0A] flex items-start gap-1.5">
          <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[#D9531E]" />
          <span><strong>Kitchen Note:</strong> {order.special_instructions}</span>
        </div>
      )}

      {/* Total & Action Buttons */}
      <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-baseline gap-1">
          <span className="text-xs text-stone-600">Total:</span>
          <span className="text-base font-extrabold text-[#1C130E]">₹{order.total}</span>
          <span className="text-[10px] text-stone-600 font-medium">(Authoritative)</span>
        </div>

        {/* Transition Buttons */}
        <div className="flex items-center gap-1.5">
          {order.status === 'received' && (
            <>
              <button
                onClick={() => handleStatusChange('cancelled')}
                disabled={isUpdating}
                className="px-2.5 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-semibold cursor-pointer transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusChange('preparing')}
                disabled={isUpdating}
                className="px-3.5 py-1.5 rounded-xl bg-[#1C130E] hover:bg-[#D9531E] text-white text-xs font-bold cursor-pointer transition flex items-center gap-1 shadow-xs disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ChefHat className="h-3.5 w-3.5 text-[#C89242]" />}
                <span>Start Preparing</span>
              </button>
            </>
          )}

          {order.status === 'preparing' && (
            <>
              <button
                onClick={() => handleStatusChange('cancelled')}
                disabled={isUpdating}
                className="px-2.5 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-semibold cursor-pointer transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusChange('ready')}
                disabled={isUpdating}
                className="px-3.5 py-1.5 rounded-xl bg-[#D9531E] hover:bg-[#B83F12] text-white text-xs font-bold cursor-pointer transition flex items-center gap-1 shadow-xs disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BellRing className="h-3.5 w-3.5" />}
                <span>Mark Ready</span>
              </button>
            </>
          )}

          {order.status === 'ready' && (
            <button
              onClick={() => handleStatusChange('completed')}
              disabled={isUpdating}
              className="px-4 py-1.5 rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-bold cursor-pointer transition flex items-center gap-1 shadow-xs disabled:opacity-50"
            >
              {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              <span>Complete Order</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

