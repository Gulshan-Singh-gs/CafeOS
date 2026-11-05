'use client';

import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  Search,
  Sparkles,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { MenuItem, Category } from '@/lib/types';

interface MenuManagerProps {
  cafeId: string;
  items: MenuItem[];
  categories: Category[];
  onRefreshItems: () => Promise<void>;
}

export function MenuManager({
  cafeId,
  items,
  categories,
  onRefreshItems,
}: MenuManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // New Item Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newIsVeg, setNewIsVeg] = useState(true);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // Edit Item State
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Action status message
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'all' && item.category_id !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Toggle item availability
  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const newAvail = !item.is_available;
      const res = await fetch(`/api/menu/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: newAvail }),
      });

      if (!res.ok) throw new Error('Failed to update availability');

      await onRefreshItems();
      setStatusMessage({
        type: 'success',
        text: `"${item.name}" marked as ${newAvail ? 'Available' : 'Sold Out'}.`,
      });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: unknown) {
      const e = err as Error;
      setStatusMessage({ type: 'error', text: e.message });
    }
  };

  // Quick edit price
  const handleSavePrice = async (itemId: string) => {
    try {
      setIsSavingEdit(true);
      const res = await fetch(`/api/menu/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: editPrice }),
      });

      if (!res.ok) throw new Error('Failed to update price');

      await onRefreshItems();
      setEditingItemId(null);
      setStatusMessage({ type: 'success', text: 'Price updated successfully in database.' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: unknown) {
      const e = err as Error;
      setStatusMessage({ type: 'error', text: e.message });
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete item
  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) return;

    try {
      const res = await fetch(`/api/menu/${itemId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete item');

      await onRefreshItems();
      setStatusMessage({ type: 'success', text: `"${itemName}" deleted.` });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: unknown) {
      const e = err as Error;
      setStatusMessage({ type: 'error', text: e.message });
    }
  };

  // Create new item
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice) return;

    try {
      setIsSubmittingNew(true);
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cafe_id: cafeId,
          name: newName.trim(),
          description: newDesc.trim(),
          price: Number(newPrice),
          category_id: newCategoryId || categories[0]?.id || '',
          is_veg: newIsVeg,
          image_url: newImageUrl.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error('Failed to create item');

      await onRefreshItems();
      setIsAddModalOpen(false);
      setNewName('');
      setNewDesc('');
      setNewPrice('');
      setNewImageUrl('');
      setStatusMessage({ type: 'success', text: 'New menu item created and published.' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: unknown) {
      const e = err as Error;
      setStatusMessage({ type: 'error', text: e.message });
    } finally {
      setIsSubmittingNew(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <Check className="h-4 w-4 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8DED1] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-600" />
            <input
              type="text"
              placeholder="Search items by name or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-[#E8DED1] bg-[#FDFBF7] text-[#1C130E] focus:outline-none focus:ring-2 focus:ring-[#C89242]"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-[#E8DED1] bg-[#FDFBF7] text-[#1C130E] focus:outline-none focus:ring-2 focus:ring-[#C89242]"
          >
            <option value="all">All Categories ({items.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 bg-[#1C130E] hover:bg-[#D9531E] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
        >
          <Plus className="h-4 w-4 text-[#C89242]" />
          <span>Add New Menu Item</span>
        </button>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl border border-[#E8DED1] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F0] border-b border-[#E8DED1] text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Item Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price (INR)</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredItems.map((item) => {
                const category = categories.find((c) => c.id === item.category_id);
                const isEditing = editingItemId === item.id;

                return (
                  <tr key={item.id} className="hover:bg-[#FDFBF7] transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-10 w-10 rounded-lg object-cover shrink-0 border border-stone-200"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                item.is_veg ? 'bg-emerald-600' : 'bg-rose-600'
                              }`}
                            />
                            <p className="font-bold text-[#1C130E]">{item.name}</p>
                          </div>
                          <p className="text-[11px] text-stone-600 truncate max-w-xs mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-stone-600">
                      <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full font-medium text-[11px]">
                        {category?.name || 'Unassigned'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(Number(e.target.value))}
                            className="w-16 px-2 py-1 text-xs border rounded-lg focus:ring-1 focus:ring-[#C89242]"
                          />
                          <button
                            onClick={() => handleSavePrice(item.id)}
                            disabled={isSavingEdit}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Save Price"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingItemId(null)}
                            className="p-1 text-stone-400 hover:bg-stone-50 rounded"
                            title="Cancel"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-[#1C130E]">₹{item.price}</span>
                          <button
                            onClick={() => {
                              setEditingItemId(item.id);
                              setEditPrice(item.price);
                            }}
                            className="text-stone-400 hover:text-[#D9531E] p-0.5 cursor-pointer"
                            title="Edit price"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] cursor-pointer transition border inline-flex items-center gap-1.5 ${
                          item.is_available
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-stone-200 text-stone-600 border-stone-300 hover:bg-stone-300'
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            item.is_available ? 'bg-emerald-600' : 'bg-stone-500'
                          }`}
                        />
                        <span>{item.is_available ? 'Available' : 'Sold Out'}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        className="text-stone-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition cursor-pointer"
                        title="Delete menu item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E8DED1] shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-base text-[#1C130E] font-serif">
                Add New Menu Item
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masala Chai Frappe"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#C89242] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Price in INR (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 150"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#C89242] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={newCategoryId}
                    onChange={(e) => setNewCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#C89242] focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Freshly blended with roasted spices..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#C89242] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#C89242] focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newIsVeg}
                  onChange={(e) => setNewIsVeg(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="font-semibold text-stone-700">Pure Vegetarian Recipe</span>
              </label>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNew}
                  className="px-4 py-2 bg-[#D9531E] hover:bg-[#B83F12] text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingNew ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  <span>Publish Item</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

