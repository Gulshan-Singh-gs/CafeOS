import Link from 'next/link';
import {
  Coffee,
  ShoppingBag,
  ChefHat,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Smartphone,
  Store,
  Layers,
  IndianRupee,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C130E] flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-[#E8DED1] bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#D9531E] to-[#C89242] flex items-center justify-center font-black text-white shadow-md">
              <Coffee className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-[#1C130E]">
                CafeOS
              </span>
              <span className="ml-2 text-[10px] font-bold bg-amber-100 text-[#8C2E0A] px-2 py-0.5 rounded-full border border-amber-200">
                MVP Punjab Edition
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/cafe/kurali-chai-bakehouse"
              className="text-xs font-semibold text-stone-700 hover:text-[#D9531E] px-3 py-1.5 rounded-xl transition hidden sm:block"
            >
              Browse Kurali Menu
            </Link>
            <Link
              href="/dashboard"
              className="text-xs font-bold bg-[#1C130E] hover:bg-[#D9531E] text-white px-4 py-2 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <ChefHat className="h-3.5 w-3.5 text-[#C89242]" />
              <span>Owner Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-[#8C2E0A]">
            <Sparkles className="h-3.5 w-3.5 text-[#C89242]" />
            <span>Target Initial Deployment: Kurali, SAS Nagar, Punjab</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#1C130E] tracking-tight font-serif leading-tight">
            The Digital Operating System for <span className="text-[#D9531E]">Independent Indian Cafés</span>
          </h1>

          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            From slow-simmered kulhad chai to artisan sourdough melts. Zero aggregators, zero commissions. Complete customer-to-counter ordering with authoritative INR billing and live kitchen sync.
          </p>

          {/* Quick Demo Access Switchers */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/cafe/kurali-chai-bakehouse"
              className="px-6 py-3.5 rounded-2xl bg-[#D9531E] hover:bg-[#B83F12] text-white font-bold text-sm shadow-md transition flex items-center gap-2 active:scale-95"
            >
              <Smartphone className="h-4 w-4" />
              <span>Customer Storefront (Kurali Demo)</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/dashboard"
              className="px-6 py-3.5 rounded-2xl bg-[#1C130E] hover:bg-stone-800 text-white font-bold text-sm shadow-md transition flex items-center gap-2 active:scale-95"
            >
              <ChefHat className="h-4 w-4 text-[#C89242]" />
              <span>Owner Portal & Kitchen Terminal</span>
            </Link>
          </div>
        </div>

        {/* Live Interactive Walkthrough Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {/* Tenant 1 Showcase Card */}
          <div className="rounded-3xl bg-white border border-[#E8DED1] p-6 sm:p-8 shadow-md flex flex-col justify-between hover:border-[#C89242] transition">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D9531E] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                  Primary Seed Tenant
                </span>
                <span className="text-xs text-stone-600 font-medium">Kurali, Punjab (140103)</span>
              </div>

              <div>
                <h3 className="text-xl font-bold font-serif text-[#1C130E]">
                  Verma & Sons — Kurali Chai & Bakehouse
                </h3>
                <p className="text-xs text-stone-600 mt-1">
                  Morinda Road flagship cafe seeded with 12 authentic menu items in INR: Kulhad Adrak Elaichi Chai, Amritsari Paneer Tikka Toastie, Bun Maska, Highway Cold Coffee, and Samosa Chaat.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-100 text-xs text-stone-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Interactive mobile cart with quantity controls</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Real-time kitchen order tracker (`/order/[id]`)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Live price editing & stock toggles in dashboard</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-stone-100 flex items-center justify-between">
              <Link
                href="/cafe/kurali-chai-bakehouse"
                className="text-xs font-bold text-[#D9531E] hover:underline flex items-center gap-1.5"
              >
                <span>Launch Customer Storefront</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/dashboard"
                className="text-xs font-bold text-stone-700 hover:text-black flex items-center gap-1.5"
              >
                <span>Open Kitchen Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Tenant 2 Showcase Card (Multi-Tenancy Verification) */}
          <div className="rounded-3xl bg-white border border-[#E8DED1] p-6 sm:p-8 shadow-md flex flex-col justify-between hover:border-[#C89242] transition">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                  Tenant Isolation Benchmark
                </span>
                <span className="text-xs text-stone-600 font-medium">Pinjore, Haryana</span>
              </div>

              <div>
                <h3 className="text-xl font-bold font-serif text-[#1C130E]">
                  Shivalik Foothills Brews (Pinjore)
                </h3>
                <p className="text-xs text-stone-600 mt-1">
                  Second independent café tenant strictly scoped by `cafe_id`. Proves that orders and private catalog items from Café A are strictly invisible to Café B.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-100 text-xs text-stone-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Database Row-Level Security (RLS) enforcement</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Server-side tenant authorization & validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Instant demo reset with authoritative seed</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-stone-100 flex items-center justify-between">
              <Link
                href="/cafe/pinjore-brews"
                className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1.5"
              >
                <span>Launch Pinjore Storefront</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/dashboard"
                className="text-xs font-bold text-stone-700 hover:text-black flex items-center gap-1.5"
              >
                <span>Switch Tenant in Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Architecture & Engineering Standards Banner */}
        <div className="rounded-3xl bg-[#1C130E] text-white p-6 sm:p-8 border border-[#3D251A] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#C89242]">
                Architectural Guarantees
              </span>
              <h2 className="text-xl sm:text-2xl font-bold mt-1 font-serif">
                Production-Ready Multi-Tenant Architecture
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
              <ShieldCheck className="h-4 w-4 text-[#C89242]" />
              <span>Zero client price trust • Full RLS isolation</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-300">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
              <p className="font-bold text-white text-sm">Authoritative Pricing</p>
              <p className="text-stone-400">
                Clients submit only item IDs and quantities. Prices are calculated authoritatively by the server to prevent tamper attacks.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
              <p className="font-bold text-white text-sm">Real-Time Sync</p>
              <p className="text-stone-400">
                Customer order tracker and owner kitchen terminal automatically sync without manual page refreshes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
              <p className="font-bold text-white text-sm">Supabase Ready</p>
              <p className="text-stone-400">
                Includes full PostgreSQL DDL schema with RLS policies and zero-dependency local persistence for instant demo.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8DED1] bg-white py-6 text-center text-xs text-stone-600">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <p>© 2026 CafeOS. Handcrafted for independent cafés in Punjab, India.</p>
          <div className="flex items-center gap-4">
            <Link href="/cafe/kurali-chai-bakehouse" className="hover:text-[#D9531E]">
              Kurali Storefront
            </Link>
            <Link href="/dashboard" className="hover:text-[#D9531E]">
              Owner Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

