'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Sparkles, Filter, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Cafe, Category, MenuItem, CartItem } from '@/lib/types';
import { StorefrontHeader } from '@/components/storefront/StorefrontHeader';
import { CategoryFilter } from '@/components/storefront/CategoryFilter';
import { MenuItemCard } from '@/components/storefront/MenuItemCard';
import { CartDrawer } from '@/components/storefront/CartDrawer';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CafeStorefrontPage({ params }: PageProps) {
  const { slug } = use(params);

  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filters & Cart State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Fetch initial data
  useEffect(() => {
    async function loadStorefront() {
      try {
        setIsLoading(true);
        // Fetch cafes
        const cafeRes = await fetch(`/api/orders?cafe_id=placeholder`, { method: 'HEAD' }).catch(() => null);
        // We can fetch via local endpoints or standard API
        const res = await fetch(`/api/menu?slug=${slug}`);
        // To ensure direct reliable load, fetch through our api endpoint
        const dataRes = await fetch(`/api/orders`); // Warm up
      } catch (err) {
        // Handled below
      }
    }
  }, [slug]);

  // Load café and catalog directly via fetch
  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/menu?cafe_slug=${encodeURIComponent(slug)}`);
        
        // Fetch directly using server endpoint or initial data
        const menuRes = await fetch(`/api/menu?cafe_id=cafe-kurali-01`);
        const menuData = await menuRes.json();

        // If specific cafe requested
        if (slug === 'pinjore-brews') {
          const pRes = await fetch(`/api/menu?cafe_id=cafe-pinjore-02`);
          const pData = await pRes.json();
          if (isMounted) {
            setCafe({
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
            });
            setCategories([
              {
                id: 'cat-pinjore-01',
                cafe_id: 'cafe-pinjore-02',
                name: 'Mountain Special Brews',
                sort_order: 1,
                created_at: new Date().toISOString(),
              }
            ]);
            setMenuItems(pData.items || []);
            setIsLoading(false);
          }
          return;
        }

        // Default: Kurali Chai & Bakehouse
        if (isMounted) {
          setCafe({
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
          });

          setCategories([
            { id: 'cat-chai-01', cafe_id: 'cafe-kurali-01', name: 'Desi Chais & Hot Brews', sort_order: 1, created_at: '' },
            { id: 'cat-coffee-02', cafe_id: 'cafe-kurali-01', name: 'Artisan Espresso & Iced', sort_order: 2, created_at: '' },
            { id: 'cat-sandwiches-03', cafe_id: 'cafe-kurali-01', name: 'Toasties & Sandwiches', sort_order: 3, created_at: '' },
            { id: 'cat-bites-04', cafe_id: 'cafe-kurali-01', name: 'Street Cafe Bites', sort_order: 4, created_at: '' },
            { id: 'cat-desserts-05', cafe_id: 'cafe-kurali-01', name: 'Desserts & Bakes', sort_order: 5, created_at: '' },
          ]);

          setMenuItems(menuData.items || []);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        const error = err as Error;
        if (isMounted) {
          setLoadError(error.message || 'Failed to load cafe menu');
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Cart operations
  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menu_item.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menu_item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menu_item: item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    setCart((prev) => {
      if (newQty <= 0) {
        return prev.filter((i) => i.menu_item.id !== itemId);
      }
      return prev.map((i) =>
        i.menu_item.id === itemId ? { ...i, quantity: newQty } : i
      );
    });
  };

  const handleClearCart = () => setCart([]);

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory !== 'all' && item.category_id !== selectedCategory) {
      return false;
    }
    if (vegOnly && !item.is_veg) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  // Calculate category item counts
  const itemCounts = categories.reduce((acc, cat) => {
    acc[cat.id] = menuItems.filter((i) => i.category_id === cat.id).length;
    return acc;
  }, {} as Record<string, number>);

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartEstimatedTotal = cart.reduce(
    (sum, item) => sum + item.menu_item.price * item.quantity,
    0
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
        <div className="h-10 w-10 border-4 border-[#D9531E] border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-base font-bold text-[#1C130E]">Brewing Kurali Menu...</h2>
        <p className="text-xs text-stone-600 mt-1">Fetching fresh items & pricing</p>
      </div>
    );
  }

  if (loadError || !cafe) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
        <h1 className="text-xl font-bold text-stone-900">Café Not Found</h1>
        <p className="text-sm text-stone-600 mt-1 max-w-sm">
          We could not find an active café matching &quot;{slug}&quot;.
        </p>
        <Link
          href="/"
          className="mt-4 px-4 py-2 rounded-xl bg-[#1C130E] text-white text-xs font-bold hover:bg-[#D9531E] transition"
        >
          Return to CafeOS Explorer
        </Link>
      </div>
    );
  }

  // Schema.org Restaurant JSON-LD for Claude-SEO
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: cafe.name,
    image: cafe.banner_url,
    address: {
      '@type': 'PostalAddress',
      streetAddress: cafe.address,
      addressLocality: cafe.city,
      addressRegion: cafe.state,
      postalCode: cafe.postal_code,
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '30.8247',
      longitude: '76.5746',
    },
    telephone: cafe.phone,
    servesCuisine: ['Indian', 'Cafe', 'Tea', 'Artisan Coffee', 'Street Food'],
    priceRange: '₹₹',
    currenciesAccepted: 'INR',
    openingHours: 'Mo-Su 08:30-23:00',
    hasMenu: {
      '@type': 'Menu',
      hasMenuItem: menuItems.slice(0, 5).map((m) => ({
        '@type': 'MenuItem',
        name: m.name,
        description: m.description,
        offers: {
          '@type': 'Offer',
          price: m.price,
          priceCurrency: 'INR',
        },
      })),
    },
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-28">
      {/* JSON-LD Rich Snippet */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* Header */}
      <StorefrontHeader
        cafe={cafe}
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Search & Quick Filter Ribbon */}
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-600" />
          <input
            type="text"
            placeholder="Search chai, cold coffee, toasties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-[#E8DED1] bg-white text-[#1C130E] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C89242]"
          />
        </div>

        {/* Veg Only Toggle */}
        <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 bg-white border border-[#E8DED1] px-3 py-2 rounded-xl cursor-pointer select-none hover:bg-emerald-50 transition">
          <input
            type="checkbox"
            checked={vegOnly}
            onChange={(e) => setVegOnly(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
          />
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            Pure Veg Only
          </span>
        </label>
      </div>

      {/* Category Tabs */}
      <CategoryFilter
        categories={categories}
        selectedCategoryId={selectedCategory}
        onSelectCategory={setSelectedCategory}
        itemCounts={itemCounts}
      />

      {/* Menu Cards Catalog */}
      <main className="max-w-5xl mx-auto px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1C130E] font-serif">
              {selectedCategory === 'all'
                ? 'All Specialties & Fresh Bakes'
                : categories.find((c) => c.id === selectedCategory)?.name || 'Menu'}
            </h2>
            <p className="text-xs text-stone-600">
              Showing {filteredItems.length} items • Authentic Indian recipes & fresh ingredients
            </p>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8DED1] p-10 text-center">
            <Filter className="h-8 w-8 text-stone-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-stone-800">No menu items match your search</h3>
            <p className="text-xs text-stone-600 mt-1">Try clearing your filters or search term</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setVegOnly(false);
              }}
              className="mt-3 text-xs font-bold text-[#D9531E] hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => {
              const inCart = cart.find((i) => i.menu_item.id === item.id)?.quantity || 0;
              return (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  quantityInCart={inCart}
                  onAddToCart={handleAddToCart}
                  onUpdateQuantity={handleUpdateQuantity}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar (Mobile & Desktop) */}
      {cartTotalCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto">
          <div className="bg-[#1C130E] text-white rounded-2xl p-3 shadow-2xl border border-[#C89242] flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-xl bg-[#D9531E] flex items-center justify-center font-bold text-white shadow-inner">
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -top-1.5 -right-1.5 bg-[#C89242] text-black text-[10px] font-extrabold h-5 w-5 rounded-full flex items-center justify-center">
                  {cartTotalCount}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-stone-300">Total in Cart</p>
                <p className="text-base font-extrabold text-[#C89242]">₹{cartEstimatedTotal}</p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-[#D9531E] hover:bg-[#B83F12] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <span>View Cart & Checkout</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        cafeId={cafe.id}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
      />
    </div>
  );
}

