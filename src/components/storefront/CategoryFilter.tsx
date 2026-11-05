'use client';

import React from 'react';
import { Category } from '@/lib/types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  itemCounts: Record<string, number>;
}

export function CategoryFilter({
  categories,
  selectedCategoryId,
  onSelectCategory,
  itemCounts,
}: CategoryFilterProps) {
  return (
    <div className="sticky top-0 z-20 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E8DED1] px-4 py-2.5 overflow-x-auto no-scrollbar shadow-xs">
      <div className="flex items-center gap-2 max-w-5xl mx-auto min-w-max">
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
            selectedCategoryId === 'all'
              ? 'bg-[#1C130E] text-white shadow-sm ring-2 ring-[#C89242]'
              : 'bg-[#F7F3EA] text-[#421E10] hover:bg-[#EFE7D5]'
          }`}
        >
          All Items ({Object.values(itemCounts).reduce((a, b) => a + b, 0)})
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              selectedCategoryId === cat.id
                ? 'bg-[#1C130E] text-white shadow-sm ring-2 ring-[#C89242]'
                : 'bg-[#F7F3EA] text-[#421E10] hover:bg-[#EFE7D5]'
            }`}
          >
            <span>{cat.name}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategoryId === cat.id ? 'bg-[#C89242] text-black font-bold' : 'bg-[#E8DED1] text-stone-700'
              }`}
            >
              {itemCounts[cat.id] || 0}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

