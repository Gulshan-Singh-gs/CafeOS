'use client';

import React from 'react';
import { IndianRupee, ShoppingBag, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { Order } from '@/lib/types';

interface StatCardsProps {
  orders: Order[];
}

export function StatCards({ orders }: StatCardsProps) {
  const totalOrders = orders.length;
  const activeOrders = orders.filter(
    (o) => o.status === 'received' || o.status === 'preparing' || o.status === 'ready'
  ).length;
  const completedOrders = orders.filter((o) => o.status === 'completed').length;

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const avgOrderValue =
    totalOrders - orders.filter((o) => o.status === 'cancelled').length > 0
      ? Math.round(
          totalRevenue /
            (totalOrders - orders.filter((o) => o.status === 'cancelled').length)
        )
      : 0;

  const stats = [
    {
      label: "Today's Gross Sales",
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      sub: `${completedOrders} settled orders`,
      icon: IndianRupee,
      color: 'text-[#D9531E]',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
    {
      label: 'Live Kitchen Orders',
      value: activeOrders,
      sub: 'Needs attention or prep',
      icon: Clock,
      color: 'text-[#C89242]',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
    },
    {
      label: 'Total Orders Today',
      value: totalOrders,
      sub: `Avg ticket: ₹${avgOrderValue}`,
      icon: ShoppingBag,
      color: 'text-stone-800',
      bg: 'bg-stone-50',
      border: 'border-stone-200',
    },
    {
      label: 'Completed & Served',
      value: completedOrders,
      sub: '100% customer satisfaction',
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`p-4 sm:p-5 rounded-2xl bg-white border ${stat.border} shadow-2xs flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-600">{stat.label}</span>
              <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-2">
              <p className="text-xl sm:text-2xl font-black text-[#1C130E] tracking-tight">
                {stat.value}
              </p>
              <p className="text-[11px] text-stone-600 font-medium mt-0.5">{stat.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

