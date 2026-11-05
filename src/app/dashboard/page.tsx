'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Clock,
  Filter,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Volume2,
  ArrowRight,
} from 'lucide-react';
import { Cafe, Order, MenuItem, Category, OrderStatus } from '@/lib/types';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatCards } from '@/components/dashboard/StatCards';
import { OrderCard } from '@/components/dashboard/OrderCard';
import { MenuManager } from '@/components/dashboard/MenuManager';

export default function DashboardPage() {
  const [activeCafeId, setActiveCafeId] = useState<string>('cafe-kurali-01');
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');
  const [orderFilter, setOrderFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial available cafes
  useEffect(() => {
    setCafes([
      {
        id: 'cafe-kurali-01',
        slug: 'kurali-chai-bakehouse',
        name: 'Verma & Sons — Kurali Chai & Bakehouse',
        tagline: 'Artisanal Chai, Handcrafted Roasts & Fresh Bakes on Morinda Road',
        description: 'Serving Kurali with authentic slow-brewed kulhad chai, stone-ground espresso, freshly baked sourdough toasties, and indulgent street-style cafe bakes.',
        address: 'Shop 14-16, Main Morinda Road, Near Kurali Bus Stand',
        city: 'Kurali',
        state: 'Punjab',
        postal_code: '140103',
        phone: '+91 98765 43210',
        currency: 'INR',
        currency_symbol: '₹',
        logo_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&auto=format&fit=crop&q=80',
        banner_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80',
        opening_time: '08:30 AM',
        closing_time: '11:00 PM',
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'cafe-pinjore-02',
        slug: 'pinjore-brews',
        name: 'Shivalik Foothills Brews',
        tagline: 'Mountain Valley Coffee & Continental Bites',
        description: 'Cozy retreat serving estate-sourced Arabica and quick cafe bites.',
        address: 'SCF 12, Kalka Highway',
        city: 'Pinjore',
        state: 'Haryana',
        postal_code: '134102',
        phone: '+91 98123 45678',
        currency: 'INR',
        currency_symbol: '₹',
        logo_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&auto=format&fit=crop&q=80',
        banner_url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1200&auto=format&fit=crop&q=80',
        opening_time: '09:00 AM',
        closing_time: '10:00 PM',
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ]);
  }, []);

  const currentCafe = cafes.find((c) => c.id === activeCafeId) || cafes[0] || {
    id: 'cafe-kurali-01',
    slug: 'kurali-chai-bakehouse',
    name: 'Verma & Sons — Kurali Chai & Bakehouse',
    city: 'Kurali',
  } as Cafe;

  // Fetch orders and menu items for active cafe
  const fetchDashboardData = async (silent = false) => {
    try {
      if (!silent) setIsRefreshing(true);

      const [ordersRes, menuRes] = await Promise.all([
        fetch(`/api/orders?cafe_id=${activeCafeId}`),
        fetch(`/api/menu?cafe_id=${activeCafeId}`),
      ]);

      const [ordersData, menuData] = await Promise.all([
        ordersRes.json(),
        menuRes.json(),
      ]);

      if (ordersData.orders) setOrders(ordersData.orders);
      if (menuData.items) setMenuItems(menuData.items);

      if (activeCafeId === 'cafe-kurali-01') {
        setCategories([
          { id: 'cat-chai-01', cafe_id: 'cafe-kurali-01', name: 'Desi Chais & Hot Brews', sort_order: 1, created_at: '' },
          { id: 'cat-coffee-02', cafe_id: 'cafe-kurali-01', name: 'Artisan Espresso & Iced', sort_order: 2, created_at: '' },
          { id: 'cat-sandwiches-03', cafe_id: 'cafe-kurali-01', name: 'Toasties & Sandwiches', sort_order: 3, created_at: '' },
          { id: 'cat-bites-04', cafe_id: 'cafe-kurali-01', name: 'Street Cafe Bites', sort_order: 4, created_at: '' },
          { id: 'cat-desserts-05', cafe_id: 'cafe-kurali-01', name: 'Desserts & Bakes', sort_order: 5, created_at: '' },
        ]);
      } else {
        setCategories([
          { id: 'cat-pinjore-01', cafe_id: 'cafe-pinjore-02', name: 'Mountain Special Brews', sort_order: 1, created_at: '' },
        ]);
      }

      setError(null);
    } catch (err: unknown) {
      const e = err as Error;
      if (!silent) setError(e.message || 'Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchDashboardData(false);

    // Live auto-polling every 4 seconds to sync incoming customer orders!
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeCafeId]);

  // Handle status update from card
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status on server');
      }

      const data = await res.json();
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? data.order : o))
      );
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message);
      // Revert with fresh data
      fetchDashboardData(true);
    }
  };

  // Reset Demo Data
  const handleResetDemo = async () => {
    if (!confirm('Reset all demo data back to default initial seed?')) return;
    try {
      setIsResetting(true);
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      if (!res.ok) throw new Error('Reset failed');
      await fetchDashboardData(false);
    } catch (err: unknown) {
      const e = err as Error;
      alert(`Error resetting demo: ${e.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'active') {
      return o.status === 'received' || o.status === 'preparing' || o.status === 'ready';
    }
    if (orderFilter === 'completed') {
      return o.status === 'completed';
    }
    if (orderFilter === 'cancelled') {
      return o.status === 'cancelled';
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C130E] pb-20">
      {/* Top Header */}
      <DashboardHeader
        currentCafe={currentCafe}
        availableCafes={cafes}
        onSwitchCafe={(id) => setActiveCafeId(id)}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 space-y-6">
        {/* Error notification banner if any */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-stone-400 hover:text-stone-700 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Real-time sync ticker */}
        <div className="flex items-center justify-between text-xs text-stone-600 bg-[#FAF7F0] px-4 py-2 rounded-xl border border-[#EFE7D5]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-stone-800">Live Kitchen Terminal</span>
            <span>•</span>
            <span>Polling incoming customer orders automatically every 4s</span>
          </div>

          <button
            onClick={() => fetchDashboardData(false)}
            className="flex items-center gap-1 font-semibold text-[#D9531E] hover:underline cursor-pointer"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync Now</span>
          </button>
        </div>

        {/* Analytics Stat Cards */}
        <StatCards orders={orders} />

        {/* Tab 1: Live Kitchen Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E8DED1] shadow-2xs">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setOrderFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    orderFilter === 'all'
                      ? 'bg-[#1C130E] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  All Orders ({orders.length})
                </button>
                <button
                  onClick={() => setOrderFilter('active')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    orderFilter === 'active'
                      ? 'bg-[#D9531E] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <Clock className="h-3 w-3" />
                  <span>Active in Kitchen ({orders.filter((o) => o.status === 'received' || o.status === 'preparing' || o.status === 'ready').length})</span>
                </button>
                <button
                  onClick={() => setOrderFilter('completed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    orderFilter === 'completed'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Completed ({orders.filter((o) => o.status === 'completed').length})
                </button>
                <button
                  onClick={() => setOrderFilter('cancelled')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    orderFilter === 'cancelled'
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Cancelled ({orders.filter((o) => o.status === 'cancelled').length})
                </button>
              </div>

              <div className="text-[11px] font-medium text-stone-600 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-[#C89242]" />
                <span>Authoritative INR order calculations</span>
              </div>
            </div>

            {/* Orders Feed */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E8DED1] p-12 text-center shadow-xs">
                <ShoppingBag className="h-10 w-10 text-stone-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-stone-800">No orders match this filter</h3>
                <p className="text-xs text-stone-600 mt-1">
                  Place a new order from the customer storefront or switch filters.
                </p>
                <Link
                  href={`/cafe/${currentCafe.slug}`}
                  target="_blank"
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D9531E] text-white text-xs font-bold hover:bg-[#B83F12] transition"
                >
                  <span>Open Customer Storefront</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onUpdateStatus={handleUpdateOrderStatus}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Menu & Pricing Management */}
        {activeTab === 'menu' && (
          <MenuManager
            cafeId={activeCafeId}
            items={menuItems}
            categories={categories}
            onRefreshItems={() => fetchDashboardData(true)}
          />
        )}
      </main>
    </div>
  );
}

