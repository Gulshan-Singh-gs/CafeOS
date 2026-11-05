'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Loader2, Sparkles, AlertCircle, Utensils, Package } from 'lucide-react';
import { CartItem } from '@/lib/types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  cafeId: string;
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onClearCart: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  cafeId,
  onUpdateQuantity,
  onClearCart,
}: CartDrawerProps) {
  const router = useRouter();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [diningOption, setDiningOption] = useState<'dine_in' | 'takeaway'>('dine_in');
  const [tableNumber, setTableNumber] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const estimatedSubtotal = items.reduce(
    (sum, item) => sum + item.menu_item.price * item.quantity,
    0
  );

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add items to proceed.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      setErrorMessage('Please enter a valid phone number (at least 8-10 digits).');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        cafe_id: cafeId,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        special_instructions: specialInstructions.trim(),
        dining_option: diningOption,
        table_number: diningOption === 'dine_in' ? tableNumber.trim() : undefined,
        items: items.map(i => ({
          menu_item_id: i.menu_item.id,
          quantity: i.quantity,
          notes: i.notes,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit order. Please try again.');
      }

      // Success! Clear cart, close drawer, navigate to customer live order tracker
      onClearCart();
      onClose();
      router.push(`/order/${data.order.id}`);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Something went wrong while placing your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-[#FDFBF7] shadow-2xl flex flex-col justify-between border-l border-[#E8DED1]">
          {/* Header */}
          <div className="px-5 py-4 bg-[#1C130E] text-white flex items-center justify-between border-b border-[#3D251A]">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-[#C89242] text-black flex items-center justify-center font-bold">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold font-serif">Your Order Cart</h2>
                <p className="text-[11px] text-amber-200/80">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} selected
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {items.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-stone-600">
                <ShoppingBag className="h-12 w-12 text-stone-300 mb-3" />
                <p className="text-sm font-semibold text-stone-800">Your cart is empty</p>
                <p className="text-xs text-stone-600 mt-1">
                  Add some delicious chais, toasties, or fresh bakes to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((cartItem) => (
                  <div
                    key={cartItem.menu_item.id}
                    className="p-3 bg-white rounded-xl border border-[#E8DED1] flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[#1C130E] truncate">
                        {cartItem.menu_item.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-600">
                        <span>₹{cartItem.menu_item.price} each</span>
                        <span>•</span>
                        <span className="font-bold text-[#8C2E0A]">
                          ₹{cartItem.menu_item.price * cartItem.quantity}
                        </span>
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center bg-[#F7F3EA] rounded-lg p-1 border border-[#E8DED1]">
                      <button
                        onClick={() =>
                          onUpdateQuantity(cartItem.menu_item.id, cartItem.quantity - 1)
                        }
                        className="h-6 w-6 rounded flex items-center justify-center text-stone-700 hover:bg-white hover:text-black transition cursor-pointer"
                        title="Decrease"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-[#1C130E]">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(cartItem.menu_item.id, cartItem.quantity + 1)
                        }
                        className="h-6 w-6 rounded flex items-center justify-center text-stone-700 hover:bg-white hover:text-black transition cursor-pointer"
                        title="Increase"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => onUpdateQuantity(cartItem.menu_item.id, 0)}
                      className="text-stone-400 hover:text-red-500 p-1 cursor-pointer transition"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {items.length > 0 && (
              <form id="order-form" onSubmit={handleSubmitOrder} className="pt-3 space-y-4">
                {/* Dining Option Toggle */}
                <div>
                  <label className="block text-xs font-bold text-[#421E10] mb-1.5 uppercase tracking-wider">
                    Dining Option
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDiningOption('dine_in')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        diningOption === 'dine_in'
                          ? 'bg-[#1C130E] text-white border-[#1C130E]'
                          : 'bg-white text-stone-700 border-[#E8DED1] hover:bg-[#F7F3EA]'
                      }`}
                    >
                      <Utensils className={`h-3.5 w-3.5 ${diningOption === 'dine_in' ? 'text-[#C89242]' : 'text-stone-500'}`} />
                      <span>Dine-In (At Cafe)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiningOption('takeaway')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        diningOption === 'takeaway'
                          ? 'bg-[#1C130E] text-white border-[#1C130E]'
                          : 'bg-white text-stone-700 border-[#E8DED1] hover:bg-[#F7F3EA]'
                      }`}
                    >
                      <Package className={`h-3.5 w-3.5 ${diningOption === 'takeaway' ? 'text-[#C89242]' : 'text-stone-500'}`} />
                      <span>Takeaway (Parcel)</span>
                    </button>
                  </div>
                </div>

                {diningOption === 'dine_in' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#421E10] mb-1">
                      Table Number (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Table 4 or Outdoor 2"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-[#E8DED1] bg-white text-[#1C130E] focus:outline-none focus:ring-2 focus:ring-[#C89242]"
                    />
                  </div>
                )}

                {/* Customer Details */}
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#421E10] mb-1">
                      Your Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Harpreet Singh"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-[#E8DED1] bg-white text-[#1C130E] focus:outline-none focus:ring-2 focus:ring-[#C89242]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#421E10] mb-1">
                      Phone Number (for order SMS/updates) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 98140 12345"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-[#E8DED1] bg-white text-[#1C130E] focus:outline-none focus:ring-2 focus:ring-[#C89242]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#421E10] mb-1">
                      Kitchen Notes / Special Requests
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Less sugar, extra crispy, no onion..."
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-[#E8DED1] bg-white text-[#1C130E] focus:outline-none focus:ring-2 focus:ring-[#C89242]"
                    />
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-5 bg-white border-t border-[#E8DED1] space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-stone-800">₹{estimatedSubtotal}</span>
                </div>
                <div className="flex justify-between text-[#2E7D32]">
                  <span>Cafe Service & Packaging</span>
                  <span>FREE</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#1C130E] pt-2 border-t border-stone-100">
                  <span>Authoritative Total</span>
                  <span className="text-[#D9531E]">₹{estimatedSubtotal}</span>
                </div>
              </div>

              <button
                type="submit"
                form="order-form"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-[#D9531E] hover:bg-[#B83F12] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Verifying & Submitting Order...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Place Order</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <p className="text-[10px] text-stone-600 text-center flex items-center justify-center gap-1">
                <Sparkles className="h-3 w-3 text-[#C89242]" />
                <span>Price verified authoritatively by CafeOS server</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

