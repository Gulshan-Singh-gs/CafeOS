'use client';

import React from 'react';
import { Plus, Minus, Clock, Flame } from 'lucide-react';
import { MenuItem } from '@/lib/types';

interface MenuItemCardProps {
  item: MenuItem;
  quantityInCart: number;
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity: (itemId: string, newQty: number) => void;
}

export function MenuItemCard({
  item,
  quantityInCart,
  onAddToCart,
  onUpdateQuantity,
}: MenuItemCardProps) {
  const isAvailable = item.is_available;

  return (
    <article className={`relative flex flex-col sm:flex-row justify-between rounded-2xl border transition-all duration-200 overflow-hidden bg-white ${
      isAvailable
        ? 'border-[#E8DED1] hover:border-[#C89242] hover:shadow-md'
        : 'border-stone-200 opacity-65 bg-stone-50'
    }`}>
      {/* Item Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Top Badges */}
          <div className="flex items-center gap-2 mb-1.5">
            {/* Indian FSSAI Veg Symbol */}
            <span
              className={`flex h-4 w-4 items-center justify-center border rounded-xs ${
                item.is_veg ? 'border-emerald-600' : 'border-rose-600'
              }`}
              title={item.is_veg ? 'Pure Vegetarian' : 'Non-Vegetarian'}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  item.is_veg ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              />
            </span>

            {item.is_featured && (
              <span className="flex items-center gap-1 rounded-full bg-amber-100 text-[#8C2E0A] px-2 py-0.5 text-[10px] font-bold">
                <Flame className="h-3 w-3 text-[#D9531E]" />
                Chef's Bestseller
              </span>
            )}

            {!isAvailable && (
              <span className="rounded-full bg-stone-200 text-stone-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Sold Out
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-[#1C130E] leading-snug">
            {item.name}
          </h3>

          <p className="mt-1 text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Price & Meta */}
        <div className="mt-4 flex items-center justify-between pt-2 border-t border-[#F7F3EA]">
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-extrabold text-[#1C130E]">
              ₹{item.price}
            </span>
            <span className="text-[11px] text-stone-600 font-medium">INR</span>
          </div>

          {item.preparation_time_minutes && (
            <div className="flex items-center gap-1 text-[11px] text-stone-600 font-medium">
              <Clock className="h-3 w-3 text-[#C89242]" />
              <span>~{item.preparation_time_minutes} mins</span>
            </div>
          )}
        </div>
      </div>

      {/* Item Image & Action Box */}
      <div className="relative w-full sm:w-44 h-40 sm:h-auto shrink-0 bg-stone-100 flex flex-col justify-end">
        <img
          src={item.image_url}
          alt={item.name}
          className={`h-full w-full object-cover ${!isAvailable ? 'grayscale' : ''}`}
          loading="lazy"
        />

        {/* Availability Overlay */}
        {!isAvailable ? (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-2 text-center">
            <span className="bg-white/90 text-stone-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              Currently Unavailable
            </span>
          </div>
        ) : (
          /* Add / Quantity Button Pill */
          <div className="absolute bottom-2.5 right-2.5 sm:left-1/2 sm:-translate-x-1/2">
            {quantityInCart === 0 ? (
              <button
                onClick={() => onAddToCart(item)}
                className="flex items-center gap-1.5 bg-[#1C130E] hover:bg-[#D9531E] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md transition-all duration-150 cursor-pointer active:scale-95 border border-[#C89242]/40"
              >
                <Plus className="h-3.5 w-3.5 text-[#C89242]" />
                <span>ADD</span>
              </button>
            ) : (
              <div className="flex items-center bg-[#1C130E] text-white rounded-full px-2 py-1 shadow-lg border border-[#C89242]">
                <button
                  onClick={() => onUpdateQuantity(item.id, quantityInCart - 1)}
                  className="h-6 w-6 rounded-full flex items-center justify-center text-white hover:bg-stone-800 transition cursor-pointer"
                  title="Decrease"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-6 text-center text-xs font-bold text-[#C89242]">
                  {quantityInCart}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.id, quantityInCart + 1)}
                  className="h-6 w-6 rounded-full flex items-center justify-center text-white hover:bg-stone-800 transition cursor-pointer"
                  title="Increase"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

