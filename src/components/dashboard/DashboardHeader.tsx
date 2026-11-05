'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Coffee,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Building2,
  Check,
  Menu,
  ShoppingBag,
  ChevronDown,
} from 'lucide-react';
import { Cafe } from '@/lib/types';

interface DashboardHeaderProps {
  currentCafe: Cafe;
  availableCafes: Cafe[];
  onSwitchCafe: (cafeId: string) => void;
  onResetDemo: () => Promise<void>;
  isResetting: boolean;
  activeTab: 'orders' | 'menu';
  onTabChange: (tab: 'orders' | 'menu') => void;
}

export function DashboardHeader({
  currentCafe,
  availableCafes,
  onSwitchCafe,
  onResetDemo,
  isResetting,
  activeTab,
  onTabChange,
}: DashboardHeaderProps) {
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);

  return (
    <header className="bg-[#1C130E] text-white border-b border-[#3D251A] sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-y-3 py-3.5">
          {/* Brand & Tenant Selector */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#D9531E] to-[#C89242] flex items-center justify-center font-black text-black shadow-md">
                <Coffee className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white">CafeOS</span>
                  <span className="bg-[#C89242] text-black text-[10px] font-bold px-1.5 py-0.2 rounded uppercase">
                    Admin
                  </span>
                </div>
                <p className="text-[10px] text-amber-200/70">Punjab Operations Suite</p>
              </div>
            </Link>

            <span className="h-6 w-px bg-stone-700 hidden sm:block" />

            {/* Multi-Tenant Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTenantDropdown(!showTenantDropdown)}
                className="flex items-center gap-2 bg-[#2E1D14] hover:bg-[#3D271B] border border-[#523323] px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-100 transition cursor-pointer"
                title="Switch Tenant to test multi-tenant isolation"
              >
                <Building2 className="h-3.5 w-3.5 text-[#C89242]" />
                <span className="truncate max-w-[140px] sm:max-w-[200px]">
                  {currentCafe.name}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
              </button>

              {showTenantDropdown && (
                <div className="absolute left-0 mt-2 w-64 bg-[#23150D] border border-[#523323] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-stone-400 border-b border-stone-800">
                    Active Multi-Tenant Cafés
                  </div>
                  {availableCafes.map((cafe) => (
                    <button
                      key={cafe.id}
                      onClick={() => {
                        onSwitchCafe(cafe.id);
                        setShowTenantDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#382216] transition cursor-pointer"
                    >
                      <div>
                        <p className="font-bold text-white">{cafe.name}</p>
                        <p className="text-[10px] text-stone-400">{cafe.city}, {cafe.state}</p>
                      </div>
                      {cafe.id === currentCafe.id && (
                        <Check className="h-4 w-4 text-[#C89242]" />
                      )}
                    </button>
                  ))}
                  <div className="px-3 pt-2 text-[10px] text-amber-200/60 border-t border-stone-800">
                    Switching validates tenant isolation (isolated orders & menu).
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons: Public Storefront Link & Demo Reset */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={`/cafe/${currentCafe.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 text-xs font-semibold text-amber-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl transition"
            >
              <span>Customer Storefront</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            <button
              onClick={onResetDemo}
              disabled={isResetting}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#D9531E] hover:bg-[#B83F12] px-3.5 py-1.5 rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Reset all demo orders and catalog items to initial state"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Resetting...' : 'Reset Demo Data'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Live Orders vs Menu Catalog) */}
        <div className="flex items-center gap-4 pt-1 border-t border-[#331C11]">
          <button
            onClick={() => onTabChange('orders')}
            className={`pb-2 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'border-[#C89242] text-[#C89242]'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Live Kitchen Orders</span>
          </button>

          <button
            onClick={() => onTabChange('menu')}
            className={`pb-2 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'menu'
                ? 'border-[#C89242] text-[#C89242]'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Menu className="h-3.5 w-3.5" />
            <span>Menu & Pricing Management</span>
          </button>
        </div>
      </div>
    </header>
  );
}

