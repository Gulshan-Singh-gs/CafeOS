'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { Cafe } from '@/lib/types';

interface StorefrontHeaderProps {
  cafe: Cafe;
  cartCount: number;
  onOpenCart: () => void;
}

export function StorefrontHeader({ cafe, cartCount, onOpenCart }: StorefrontHeaderProps) {
  return (
    <header className="relative w-full overflow-hidden border-b border-[#E8DED1] bg-white">
      {/* Banner Image with Warm Vignette */}
      <div className="relative h-44 sm:h-56 w-full bg-[#1C130E]">
        <img
          src={cafe.banner_url}
          alt={cafe.name}
          className="h-full w-full object-cover opacity-85 brightness-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C130E] via-black/40 to-black/20" />

        {/* Top Floating Bar */}
        <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-xs text-white/90">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-md transition hover:bg-black/80 font-medium"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#C89242]" />
            <span>CafeOS Platform</span>
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full bg-[#D9531E] px-3.5 py-1.5 font-semibold text-white shadow-sm hover:bg-[#B83F12] transition"
          >
            Owner Portal
          </Link>
        </div>

        {/* Banner Details Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-white shrink-0">
              <img
                src={cafe.logo_url}
                alt={`${cafe.name} logo`}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="text-white drop-shadow-md">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#C89242]/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                {cafe.city}, {cafe.state}
              </span>
              <h1 className="text-lg sm:text-2xl font-bold leading-tight font-serif mt-0.5">
                {cafe.name}
              </h1>
              <p className="text-xs sm:text-sm text-amber-100/90 hidden sm:block max-w-xl">
                {cafe.tagline}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Meta Bar: Address, Hours, Call */}
      <div className="px-4 py-2.5 bg-[#FAF7F0] border-t border-[#EFE7D5] flex flex-wrap items-center justify-between gap-y-2 text-xs text-[#421E10]">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-[#D9531E] shrink-0" />
            <span className="truncate max-w-[280px] sm:max-w-md">{cafe.address}</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-[#C89242] shrink-0" />
            <span>{cafe.opening_time} – {cafe.closing_time}</span>
          </span>
          <span className="flex items-center gap-1">
            <Phone className="h-3.5 w-3.5 text-[#2E7D32] shrink-0" />
            <span>{cafe.phone}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#2E7D32] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>FSSAI Registered • Freshly Prepared</span>
        </div>
      </div>
    </header>
  );
}

