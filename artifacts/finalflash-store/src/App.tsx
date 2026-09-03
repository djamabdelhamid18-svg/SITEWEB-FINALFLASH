import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  AlertCircle, ArrowRight, ArrowUpRight, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight,
  CircleHelp, Copy, ExternalLink, Eye, FileText, Heart, History, Instagram,
  Minus, PackageCheck, Phone, Plus, Ruler, Search,
  ShieldCheck, ShoppingBag, SlidersHorizontal, Star, Truck, X, Zap
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useCreateOrder } from '@workspace/api-client-react';

const queryClient = new QueryClient();
const currency = 'DA';
const imageBase = '/images/';
const whatsappNumber = '213778659640';

import type { Color, Measurement, Product, BundleOptions, CartItem, OrderRecord } from './types/store';
import { products, honestMeasurementNotice } from './data/products';
import { wilayas, calculateDeliveryFee, normalizeAlgerianPhone } from './data/wilayas';
import { feedbacks } from './data/feedbacks';
import { useModalA11y } from './hooks/useModalA11y';

const categories = [
  { id: 'all', label: 'All pieces / كل القطع' },
  { id: 'pants', label: 'Pants & Joggers' },
  { id: 'tshirts', label: 'T-Shirts' },
  { id: 'shoes', label: 'Shoes' },
  { id: 'bundle', label: 'Special Sets' }
];

const wilayas = [
  '01 - أدرار (Adrar)', '02 - الشلف (Chlef)', '03 - الأغواط (Laghouat)', '04 - أم البواقي (Oum El Bouaghi)',
  '05 - باتنة (Batna)', '06 - بجاية (Béjaïa)', '07 - بسكرة (Biskra)', '08 - بشار (Béchar)',
  '09 - البليدة (Blida)', '10 - البويرة (Bouira)', '11 - تمنراست (Tamanrasset)', '12 - تبسة (Tébessa)',
  '13 - تلمسان (Tlemcen)', '14 - تيارت (Tiaret)', '15 - تيزي وزو (Tizi Ouzou)', '16 - الجزائر العاصمة (Alger)',
  '17 - الجلفة (Djelfa)', '18 - جيجل (Jijel)', '19 - سطيف (Sétif)', '20 - سعيدة (Saïda)',
  '21 - سكيكدة (Skikda)', '22 - سيدي بلعباس (Sidi Bel Abbès)', '23 - عنابة (Annaba)', '24 - قالمة (Guelma)',
  '25 - قسنطينة (Constantine)', '26 - المدية (Médéa)', '27 - مستغانم (Mostaganem)', '28 - المسيلة (M’Sila)',
  '29 - معسكر (Mascara)', '30 - ورقلة (Ouargla)', '31 - وهران (Oran)', '32 - البيض (El Bayadh)',
  '33 - إليزي (Illizi)', '34 - برج بوعريريج (Bordj Bou Arreridj)', '35 - بومرداس (Boumerdès)', '36 - الطارف (El Tarf)',
  '37 - تندوف (Tindouf)', '38 - تيسمسيلت (Tissemsilt)', '39 - الوادي (El Oued)', '40 - خنشلة (Khenchela)',
  '41 - سوق أهراس (Souk Ahras)', '42 - تيبازة (Tipaza)', '43 - ميلة (Mila)', '44 - عين الدفلى (Aïn Defla)',
  '45 - النعامة (Naâma)', '46 - عين تموشنت (Aïn Témouchent)', '47 - غرداية (Ghardaïa)', '48 - غليزان (Relizane)',
  '49 - تيميمون (Timimoun)', '50 - برج باجي مختار (Bordj Badji Mokhtar)', '51 - أولاد جلال (Ouled Djellal)',
  '52 - بني عباس (Béni Abbès)', '53 - عين صالح (In Salah)', '54 - عين قزام (In Guezzam)', '55 - تقرت (Touggourt)',
  '56 - جانت (Djanet)', '57 - المغير (El M’Ghair)', '58 - المنيعة (El Meniaa)'
];

const feedbacks = [
  { image: 'feedback-1.jpg', title: 'محادثة زبون مؤكد', tag: 'سرعة التوصيل 24 ساعة' },
  { image: 'feedback-2.jpg', title: 'استلام الطرد وفحصه', tag: 'جودة 10/10 ومطابقة' },
  { image: 'feedback-3.jpg', title: 'تأكيد المقاسات بالمليمتر', tag: 'مطابقة تامة للوصف' },
  { image: 'feedback-4.jpg', title: 'رضا الزبون التام', tag: 'الدفع عند الاستلام' },
  { image: 'feedback-5.jpg', title: 'خامة قطنية ثقيلة', tag: 'قماش 340 GSM متين' },
  { image: 'feedback-6.jpg', title: 'ثقة متجددة وطلب ثانٍ', tag: 'زبون دائم' },
  { image: 'feedback-7.jpg', title: 'قطعة نادرة ومميزة', tag: 'اختيار موفق' },
  { image: 'feedback-8.jpg', title: 'معاينة قبل الدفع باليد', tag: 'شكراً لثقتكم' }
];

function ProductImage({
  src,
  alt,
  className = '',
  fallbackLabel = 'FINALFLASH'
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={`image-fallback flex items-center justify-center ${className}`} aria-label={alt}>
        <span className="fallback-mark border px-3 py-2 text-center text-[11px]">{fallbackLabel}</span>
      </div>
    );
  }
  const webpSrc = `${imageBase}${src.replace(/\.(jpg|jpeg|png)$/i, '.webp')}`;
  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img
        src={`${imageBase}${src}`}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={className}
        onError={() => setFailed(true)}
      />
    </picture>
  );
}

function formatPrice(price: number): string {
  return `${price.toLocaleString('fr-FR')} ${currency}`;
}

function readStored<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore quota/privacy errors
  }
}

function normalizeAlgerianPhone(input: string): { valid: boolean; normalized: string } {
  let cleaned = input.replace(/[\s\-\(\)\.]/g, '');
  if (cleaned.startsWith('+213')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('00213')) {
    cleaned = '0' + cleaned.slice(5);
  } else if (cleaned.startsWith('213')) {
    cleaned = '0' + cleaned.slice(3);
  }
  const valid = /^0[567]\d{8}$/.test(cleaned);
  return { valid, normalized: cleaned };
}

function calculateDeliveryFee(wilaya: string, method: 'home' | 'desk'): number {
  if (!wilaya) return 0;
  const match = wilaya.match(/^(\d{2})/);
  if (!match) return 600;
  const code = parseInt(match[1], 10);
  if (code === 16) {
    return method === 'home' ? 400 : 250;
  }
  const tier2 = [2, 6, 9, 10, 13, 15, 18, 19, 21, 23, 25, 26, 27, 31, 35, 42, 44];
  if (tier2.includes(code)) {
    return method === 'home' ? 600 : 400;
  }
  const tier4 = [1, 3, 7, 8, 11, 12, 17, 30, 32, 33, 37, 39, 45, 47, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58];
  if (tier4.includes(code)) {
    return method === 'home' ? 950 : 650;
  }
  return method === 'home' ? 700 : 450;
}

function generateLocalOrderNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `FF-${year}-${rand}`;
}

function App() {
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');
  const [stockOnly, setStockOnly] = useState(false);
  const [favorites, setFavorites] = useState<number[]>(() => readStored('finalflash_wishlist', []));
  const [cart, setCart] = useState<CartItem[]>(() => readStored('finalflash_cart', []));
  const [orders, setOrders] = useState<OrderRecord[]>(() => readStored('finalflash_order_history', []));

  const [quickView, setQuickView] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideTab, setGuideTab] = useState('jogger');
  const [policiesOpen, setPoliciesOpen] = useState(false);
  const [policyTab, setPolicyTab] = useState('delivery');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [bundleJoggerColor, setBundleJoggerColor] = useState('Black');
  const [bundleJoggerSize, setBundleJoggerSize] = useState('L');
  const [bundleTeeModel, setBundleTeeModel] = useState<'gymshark' | 'hardrock'>('gymshark');
  const [bundleTeeSize, setBundleTeeSize] = useState('S');

  const [notice, setNotice] = useState('');

  useEffect(() => writeStored('finalflash_wishlist', favorites), [favorites]);
  useEffect(() => writeStored('finalflash_cart', cart), [cart]);
  useEffect(() => writeStored('finalflash_order_history', orders), [orders]);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(''), 2800);
    return () => window.clearTimeout(t);
  }, [notice]);

  // Global Escape key handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (lightbox !== null) {
          setLightbox(null);
        } else if (checkoutOpen) {
          setCheckoutOpen(false);
        } else if (quickView !== null) {
          setQuickView(null);
        } else if (policiesOpen) {
          setPoliciesOpen(false);
        } else if (guideOpen) {
          setGuideOpen(false);
        } else if (historyOpen) {
          setHistoryOpen(false);
        } else if (wishlistOpen) {
          setWishlistOpen(false);
        } else if (cartOpen) {
          setCartOpen(false);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox, checkoutOpen, quickView, policiesOpen, guideOpen, historyOpen, wishlistOpen, cartOpen]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const list = products.filter(
      p =>
        (category === 'all' || p.category === category) &&
        (!stockOnly || p.inStock) &&
        (!q || `${p.title} ${p.description} ${p.category} ${p.badge}`.toLowerCase().includes(q))
    );
    return [...list].sort((a, b) =>
      sort === 'price-low' ? a.price - b.price : sort === 'price-high' ? b.price - a.price : a.id - b.id
    );
  }, [category, query, sort, stockOnly]);

  const itemCount = cart.reduce((n, item) => n + item.quantity, 0);
  const subtotal = cart.reduce((n, item) => n + item.product.price * item.quantity, 0);

  function openProduct(product: Product) {
    setQuickView(product);
    setSelectedSize(product.sizes[0] || '');
    setSelectedColor(product.colors[0] || null);
    if (product.isBundle) {
      setBundleJoggerColor('Black');
      setBundleJoggerSize('L');
      setBundleTeeModel('gymshark');
      setBundleTeeSize('S');
    }
  }

  function toggleFavorite(id: number) {
    setFavorites(prev => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter(x => x !== id) : [...prev, id];
      const prod = products.find(p => p.id === id);
      setNotice(exists ? `Removed ${prod?.title || 'piece'} from favorites` : `Added ${prod?.title || 'piece'} to favorites`);
      return updated;
    });
  }

  function addToCart(
    product: Product,
    size = product.sizes[0] || '',
    color: Color | null = product.colors[0] || null,
    bundle?: BundleOptions
  ) {
    setCart(prev => {
      if (product.isBundle && bundle) {
        const index = prev.findIndex(
          x =>
            x.product.id === product.id &&
            x.bundleOptions?.joggerColor === bundle.joggerColor &&
            x.bundleOptions?.joggerSize === bundle.joggerSize &&
            x.bundleOptions?.teeModel === bundle.teeModel &&
            x.bundleOptions?.teeSize === bundle.teeSize
        );
        if (index >= 0) {
          return prev.map((item, i) =>
            i === index ? { ...item, quantity: Math.min(item.quantity + 1, product.stockCount) } : item
          );
        }
        return [
          ...prev,
          {
            product,
            size: `Jogger: ${bundle.joggerSize} + Tee: ${bundle.teeSize}`,
            color: {
              name: `${bundle.joggerColor} Jogger + ${bundle.teeModel === 'gymshark' ? 'Gymshark' : 'Hard Rock'} Tee`,
              hex: bundle.joggerColor === 'Black' ? '#17151a' : '#8b8990',
              image: bundle.joggerColor === 'Black' ? 'jogger-black.jpg' : 'jogger-grey.jpg'
            },
            quantity: 1,
            bundleOptions: bundle
          }
        ];
      }

      const index = prev.findIndex(
        x => x.product.id === product.id && x.size === size && x.color?.name === color?.name
      );
      if (index >= 0) {
        return prev.map((item, i) =>
          i === index ? { ...item, quantity: Math.min(item.quantity + 1, product.stockCount) } : item
        );
      }
      return [...prev, { product, size, color, quantity: 1 }];
    });
    setNotice(`${product.title} added to your bag`);
  }

  function updateQuantity(index: number, delta: number) {
    setCart(prev =>
      prev.map((item, i) =>
        i === index
          ? { ...item, quantity: Math.max(1, Math.min(item.product.stockCount, item.quantity + delta)) }
          : item
      )
    );
  }

  function removeCartItem(index: number) {
    setCart(prev => prev.filter((_, i) => i !== index));
  }

  function resetFilters() {
    setCategory('all');
    setQuery('');
    setSort('featured');
    setStockOnly(false);
  }

  function recordOrder(newOrder: OrderRecord) {
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
  }

  return (
    <div dir="ltr" className="noise min-h-[100dvh] bg-[#f7f5f8] text-[#281f30]">
      {/* Top Delivery & Inspection Announcement Banner */}
      <div className="border-b border-[#33283d] bg-[#241a30] px-4 py-2.5 text-center text-[10px] font-medium tracking-[.04em] text-[#e1d6e8] sm:text-xs">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5 font-bold text-white">
            <Truck size={13} className="text-[#d5b5f0]" /> توصيل متوفر إلى 58 ولاية
          </span>
          <span className="hidden text-white/30 sm:inline">•</span>
          <span className="flex items-center gap-1.5 font-semibold text-[#f1e5f8]">
            <Eye size={13} className="text-[#d5b5f0]" /> افتح الطرد وعاين القطعة قبل دفع أي دينار
          </span>
          <span className="hidden text-white/30 md:inline">•</span>
          <span className="flex items-center gap-1.5 font-semibold text-[#f1e5f8]">
            <PackageCheck size={13} className="text-[#d5b5f0]" /> استبدال المقاس خلال 48 ساعة
          </span>
          <button
            onClick={() => {
              setPolicyTab('cod');
              setPoliciesOpen(true);
            }}
            className="underline decoration-[#d5b5f0]/60 underline-offset-2 hover:text-white"
          >
            تفاصيل الضمانات
          </button>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 border-b border-[#e4e0e8] bg-[#f7f5f8]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[74px] max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <a href="#top" dir="ltr" className="group flex items-center gap-3" data-testid="link-brand">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#22182e] ring-1 ring-[#d8c3e5]">
              <img src="/images/logo.jpg" alt="Finalflash logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="display-font text-[19px] font-bold tracking-[-.04em] text-[#241c2c]">FINALFLASH</div>
              <div className="hidden text-[9px] uppercase tracking-[.22em] text-[#847d8d] sm:block">Curated in Algeria</div>
            </div>
          </a>

          <nav
            dir="ltr"
            className="hidden items-center gap-8 text-[12px] font-semibold uppercase tracking-[.12em] text-[#625a6c] md:flex"
            aria-label="Main navigation"
          >
            <a href="#collection" className="transition-colors hover:text-[#7c3fb4]" data-testid="link-collection">
              Collection
            </a>
            <a href="#bundle-spotlight" className="transition-colors hover:text-[#7c3fb4]">
              The Set (Save 950 DA)
            </a>
            <a href="#story" className="transition-colors hover:text-[#7c3fb4]" data-testid="link-story">
              Our Standard
            </a>
            <button
              onClick={() => {
                setPolicyTab('delivery');
                setPoliciesOpen(true);
              }}
              className="transition-colors hover:text-[#7c3fb4]"
              data-testid="link-policies-header"
            >
              Policies & Delivery
            </button>
            <a href="#faq" className="transition-colors hover:text-[#7c3fb4]" data-testid="link-faq">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <label
              dir="ltr"
              className="hidden items-center gap-2 border-b border-[#bdb7c3] px-2 py-1.5 focus-within:border-[#7c3fb4] lg:flex"
            >
              <Search size={15} className="text-[#7c3fb4]" />
              <span className="sr-only">Search pieces</span>
              <input
                dir="auto"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search the edit"
                className="w-32 bg-transparent text-xs outline-none placeholder:text-[#9c95a4]"
                data-testid="input-search-desktop"
              />
            </label>

            {/* Wishlist Button */}
            <button
              onClick={() => setWishlistOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#ebe5f0]"
              aria-label="Open wishlist"
              data-testid="button-open-wishlist"
            >
              <Heart size={19} strokeWidth={1.8} className={favorites.length > 0 ? 'fill-[#7c3fb4] text-[#7c3fb4]' : ''} />
              {favorites.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#241c2c] px-1 text-[9px] font-bold text-white">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Order History Button */}
            {orders.length > 0 && (
              <button
                onClick={() => setHistoryOpen(true)}
                className="relative hidden h-10 w-10 items-center justify-center rounded-full hover:bg-[#ebe5f0] sm:flex"
                aria-label="View order history"
                title="سجل طلباتي"
              >
                <History size={18} strokeWidth={1.8} />
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#ebe5f0]"
              aria-label="Open shopping bag"
              data-testid="button-open-cart"
            >
              <ShoppingBag size={19} strokeWidth={1.8} />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#7c3fb4] px-1 text-[9px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="border-t border-[#e4e0e8] px-5 py-2.5 lg:hidden">
          <label dir="ltr" className="mx-auto flex max-w-[520px] items-center gap-2 border-b border-[#bdb7c3] px-1 py-1.5 focus-within:border-[#7c3fb4]">
            <Search size={15} className="text-[#7c3fb4]" />
            <span className="sr-only">Search pieces</span>
            <input
              dir="auto"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search the edit / ابحث عن قطعة أو مقاس"
              className="w-full bg-transparent text-xs outline-none placeholder:text-[#9c95a4]"
              data-testid="input-search-mobile"
            />
          </label>
        </div>
      </header>

      <main id="top">
        {/* Hero Section */}
        <section className="mx-auto grid max-w-[1400px] gap-8 px-5 pb-14 pt-10 sm:px-8 sm:pt-16 lg:grid-cols-[1.07fr_.93fr] lg:gap-16 lg:px-12 lg:pb-20 lg:pt-20">
          <div className="flex flex-col justify-center reveal">
            <p className="mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-[#7c3fb4]">
              <span className="h-px w-8 bg-[#b58cd9]" /> Hand-picked streetwear & thrift / الجزائر
            </p>
            <h1 dir="ltr" className="display-font max-w-[720px] text-[clamp(2.8rem,7.5vw,6.8rem)] font-bold leading-[.88] tracking-[-.075em] text-[#241c2c]">
              RARE<br />
              <span className="text-[#7c3fb4]">BY CHOICE.</span>
            </h1>
            <p className="arabic mt-7 max-w-[540px] text-[14px] leading-8 text-[#5f5566] sm:text-[15px]">
              قطع ستريت وير وثريفت منتقاة بعناية فائقة. حالة صادقة ومفحوصة باليد، كميات حصرية قليلة، ومعاينة كاملة للطرد قبل الدفع عند الاستلام في كل ربوع الجزائر.
            </p>
            <div dir="ltr" className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#collection"
                className="group flex items-center gap-3 bg-[#241c2c] px-6 py-3.5 text-xs font-bold text-white transition-colors hover:bg-[#7c3fb4]"
                data-testid="link-shop-collection"
              >
                Shop the collection <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </a>
              <button
                onClick={() => {
                  setPolicyTab('cod');
                  setPoliciesOpen(true);
                }}
                className="px-4 py-3.5 text-xs font-bold text-[#5f5667] underline decoration-[#c8bed0] underline-offset-4 hover:text-[#7c3fb4]"
                data-testid="link-our-standard"
              >
                Inspection & COD Policy
              </button>
            </div>
            <div dir="ltr" className="mt-12 grid max-w-[520px] grid-cols-3 border-y border-[#ded8e2] py-4 text-[10px] uppercase tracking-[.12em] text-[#817988]">
              <div>
                <strong className="display-font block text-lg tracking-normal text-[#2c2233]">05+1</strong> curated pieces
              </div>
              <div>
                <strong className="display-font block text-lg tracking-normal text-[#2c2233]">58</strong> wilayas
              </div>
              <div>
                <strong className="display-font block text-lg tracking-normal text-[#2c2233]">100%</strong> inspect first
              </div>
            </div>
          </div>

          {/* Hero Featured Piece */}
          <div className="relative min-h-[460px] overflow-hidden bg-[#2a2033] reveal [animation-delay:.1s] sm:min-h-[580px]">
            <ProductImage
              src="jogger-black.jpg"
              alt="Baggy Jogger in black"
              className="h-full w-full object-cover mix-blend-normal"
              fallbackLabel="BAGGY / 01"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#17121c]/85 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white sm:bottom-8 sm:left-8 sm:right-8">
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-[.18em] text-[#d3b5ef]">Featured signature piece</p>
                <h2 className="display-font text-2xl font-bold tracking-[-.04em]">Baggy Jogger</h2>
                <p className="mt-1 text-xs text-[#ddd2e4]">Black & Grey · Flaming Dice Embroidery · M · L · XL</p>
                <p className="mono-font mt-2 text-sm font-semibold text-[#d3a6f4]">{formatPrice(2900)}</p>
              </div>
              <button
                onClick={() => openProduct(products[0])}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white/10 backdrop-blur-sm transition-colors hover:bg-[#7c3fb4]"
                aria-label="View Baggy Jogger details"
                data-testid="button-view-featured"
              >
                <ArrowUpRight size={20} />
              </button>
            </div>
            <div className="absolute right-5 top-5 border border-white/25 bg-[#241a30]/80 px-3 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#f0e5f5] backdrop-blur-sm">
              Most wanted
            </div>
          </div>
        </section>

        {/* Brand Trust & Guarantees Bar (شريط الثقة والمصداقية) */}
        <section className="border-y border-[#ded7e2] bg-[#241a30] text-white">
          <div className="mx-auto grid max-w-[1400px] divide-y divide-[#3d2e4c] sm:grid-cols-2 sm:divide-y-0 sm:divide-x sm:divide-x-reverse lg:grid-cols-4">
            <div className="flex items-start gap-4 p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#382649] text-[#d5b5f0]">
                <Eye size={22} strokeWidth={1.7} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">المعاينة قبل الدفع</h3>
                <p className="arabic mt-1 text-xs leading-5 text-[#c7bbce]">
                  افتح الطرد وافحص القطعة والمقاس أمام الموزع قبل دفع أي دينار.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#382649] text-[#d5b5f0]">
                <Truck size={22} strokeWidth={1.7} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">توصيل لكل 58 ولاية</h3>
                <p className="arabic mt-1 text-xs leading-5 text-[#c7bbce]">
                  لباب منزلك أو لمكتب الاستلام، مع تتبع مستمر وسرعة شحن.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#382649] text-[#d5b5f0]">
                <PackageCheck size={22} strokeWidth={1.7} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">استبدال خلال 48 ساعة</h3>
                <p className="arabic mt-1 text-xs leading-5 text-[#c7bbce]">
                  المقاس لم يناسبك تماماً؟ نرتب لك استبدالاً سلساً وسريعاً.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#382649] text-[#d5b5f0]">
                <ShieldCheck size={22} strokeWidth={1.7} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">أصالة 100% ووصف حقيقي</h3>
                <p className="arabic mt-1 text-xs leading-5 text-[#c7bbce]">
                  حالة صادقة ومفحوصة يدوياً، معقمة ومغسولة بعناية بدون مفاجآت.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Collection Section */}
        <section id="collection" className="border-b border-[#e3dde7] bg-[#fbfafb] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#7c3fb4]">The current edit / 2026</p>
                <h2 className="display-font text-4xl font-bold tracking-[-.06em] text-[#281f30] sm:text-6xl">
                  Pieces with a past.<br />
                  <span className="text-[#7c3fb4]">A place in yours.</span>
                </h2>
              </div>
              <p className="max-w-[320px] text-sm leading-6 text-[#756c7b]">
                لا قوائم لا نهائية ولا قطع عشوائية. فقط مجموعة منتقاة بعين فاحصة نرتديها بأنفسنا.
              </p>
            </div>

            {/* Filters Bar */}
            <div className="mb-8 flex flex-col gap-4 border-y border-[#e3dde7] py-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="hide-scrollbar flex gap-1 overflow-x-auto" role="tablist" aria-label="Product categories">
                {categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`whitespace-nowrap px-3.5 py-2 text-xs font-bold transition-colors ${
                      category === c.id ? 'bg-[#241c2c] text-white' : 'text-[#766d7d] hover:text-[#7c3fb4]'
                    }`}
                    role="tab"
                    aria-selected={category === c.id}
                    data-testid={`button-category-${c.id}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-[#655b6c]">
                  <input
                    type="checkbox"
                    checked={stockOnly}
                    onChange={e => setStockOnly(e.target.checked)}
                    className="accent-[#7c3fb4]"
                    data-testid="input-stock-only"
                  />
                  <span>In stock only / متوفر فقط</span>
                </label>

                <div className="relative">
                  <SlidersHorizontal size={13} className="pointer-events-none absolute left-2.5 top-2.5 text-[#7c3fb4]" />
                  <select
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                    className="appearance-none border border-[#ddd6e1] bg-white py-2 pl-8 pr-8 text-xs text-[#514856] outline-none focus:border-[#7c3fb4]"
                    aria-label="Sort products"
                    data-testid="select-sort"
                  >
                    <option value="featured">Featured / الموصى بها</option>
                    <option value="price-low">Price: low to high / الأقل سعراً</option>
                    <option value="price-high">Price: high to low / الأعلى سعراً</option>
                  </select>
                  <ChevronDown size={13} className="pointer-events-none absolute right-2 top-2.5 text-[#847b8d]" />
                </div>
              </div>
            </div>

            <div className="mb-5 flex items-center justify-between text-[10px] uppercase tracking-[.14em] text-[#8e8695]">
              <span>
                {filtered.length} of {products.length} pieces
              </span>
              {(query || category !== 'all' || stockOnly) && (
                <button onClick={resetFilters} className="text-[#7c3fb4] underline underline-offset-2" data-testid="button-reset-filters">
                  Clear filters / مسح الفلاتر
                </button>
              )}
            </div>

            {/* Products Grid */}
            {filtered.length ? (
              <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-3 lg:gap-x-7">
                {filtered.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    favorite={favorites.includes(product.id)}
                    onFavorite={() => toggleFavorite(product.id)}
                    onOpen={() => openProduct(product)}
                    onAdd={() => {
                      if (product.isBundle) {
                        openProduct(product);
                      } else {
                        addToCart(product);
                      }
                    }}
                    delay={i * 45}
                  />
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-[#cfc6d5] px-6 py-20 text-center">
                <Search className="mx-auto mb-4 text-[#9c91a5]" size={24} />
                <h3 className="display-font text-xl font-bold">Nothing in this edit.</h3>
                <p className="mt-2 text-sm text-[#756c7b]">جرّب كلمة بحث أخرى أو تصفح كل التشكيلة.</p>
                <button onClick={resetFilters} className="mt-5 bg-[#241c2c] px-4 py-2.5 text-xs font-bold text-white" data-testid="button-empty-reset">
                  Reset view / عرض الكل
                </button>
              </div>
            )}
          </div>
        </section>

        {/* The Finalflash Set Spotlight (طقم فاينل فلاش الترويجي) */}
        <section id="bundle-spotlight" className="bg-[#251b31] px-5 py-16 text-white sm:px-8 lg:px-12 lg:py-20">
          <div className="mx-auto grid max-w-[1400px] items-center gap-10 lg:grid-cols-[1.2fr_.8fr]">
            <div>
              <p className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#d5b5f0]">
                <Zap size={14} className="text-[#d3a6f4]" /> Exclusive Bundle / وفر 950 دج
              </p>
              <h2 className="display-font max-w-[720px] text-4xl font-bold leading-[.9] tracking-[-.06em] sm:text-6xl">
                The Finalflash Set.<br />
                <span className="text-[#d3a6f4]">Jogger + Tee = 3,950 DA.</span>
              </h2>
              <p className="arabic mt-6 max-w-[570px] text-sm leading-8 text-[#c7bbce]">
                اختر بنطال الـ Baggy Jogger (باللون الأسود أو الرمادي وبمقاسك المناسب) مع تيشيرت أصلي من اختيارك (Gymshark 10/10 أو Hard Rock Vintage). وفّر 950 دج مقارنة بسعر الشراء المنفرد، مع إمكانية المعاينة قبل الدفع عند الاستلام.
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-[#dfd4e6]">
                <span className="flex items-center gap-1.5"><Check size={14} className="text-[#d3a6f4]" /> Baggy Jogger (M / L / XL)</span>
                <span className="flex items-center gap-1.5"><Check size={14} className="text-[#d3a6f4]" /> Gymshark Tee أو Hard Rock Tee</span>
                <span className="flex items-center gap-1.5"><Check size={14} className="text-[#d3a6f4]" /> توصيل 58 ولاية والمعاينة باليد</span>
              </div>
            </div>

            <div className="border border-[#6e547a] bg-[#1d1427]/80 p-6 sm:p-8">
              <div className="flex items-baseline justify-between border-b border-[#51405b] pb-4">
                <div>
                  <span className="display-font text-4xl font-bold text-white">3,950</span>
                  <span className="mono-font ml-2 text-xs text-[#b9a7c3]">DA / SET</span>
                </div>
                <span className="rounded bg-[#7c3fb4] px-2.5 py-1 text-[10px] font-bold text-white">
                  وفر 950 دج
                </span>
              </div>
              <div className="mt-5 space-y-2 text-xs text-[#b9a7c3]">
                <div className="flex justify-between">
                  <span>Regular price (منفصلين)</span>
                  <span className="line-through">4,900 DA</span>
                </div>
                <div className="flex justify-between font-bold text-[#e1c7f3]">
                  <span>سعر الطقم الترويجي</span>
                  <span>3,950 DA</span>
                </div>
              </div>
              <button
                onClick={() => openProduct(products[5])}
                className="mt-7 flex w-full items-center justify-center gap-2 bg-[#d3a6f4] py-4 text-xs font-bold text-[#271b32] transition-colors hover:bg-white"
                data-testid="button-customize-set"
              >
                Customize your set / خصص طقمك الآن <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>

        {/* Our Standard / Story Section */}
        <section id="story" className="mx-auto grid max-w-[1400px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[.82fr_1.18fr] lg:gap-24 lg:px-12 lg:py-28">
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#7c3fb4]">The Finalflash standard</p>
            <h2 className="display-font text-4xl font-bold leading-[.95] tracking-[-.06em] text-[#281f30] sm:text-6xl">
              A good piece<br />
              should have<br />
              <span className="text-[#7c3fb4]">a story.</span>
            </h2>
            <p className="arabic mt-8 max-w-[440px] text-sm leading-8 text-[#6e6575]">
              نختار كل قطعة يدوياً بعناية، نفحص خياطتها ونظافتها ونكتب حالتها بصدق تام. لا صور معدلة تخفي العيوب، ولا كميات وهمية. فقط ملابس تستحق أن تكون جزءاً من مظهرك اليومي.
            </p>
            <button
              onClick={() => {
                setPolicyTab('authenticity');
                setPoliciesOpen(true);
              }}
              className="mt-7 inline-flex items-center gap-2 text-xs font-bold text-[#2c2233] underline decoration-[#b58cd9] underline-offset-4 hover:text-[#7c3fb4]"
              data-testid="link-trust-details"
            >
              How we inspect every piece / معايير الفحص اليدوي <ArrowRight size={14} />
            </button>
          </div>

          <div id="trust" className="grid border-t border-[#ded7e2] sm:grid-cols-2">
            {[
              {
                icon: Eye,
                title: 'See before you pay',
                arabicTitle: 'المعاينة قبل الدفع',
                text: 'افتح الطرد وافحص القطعة والمقاس أمام الموزع قبل دفع أي دينار نقداً.'
              },
              {
                icon: ShieldCheck,
                title: 'Condition, clearly stated',
                arabicTitle: 'حالة صادقة 100%',
                text: 'كل قطعة ثريفت أو ستريت وير تحصل على تقييم حالة شفاف (10/10، 9.5/10) مع تفاصيل القماش.'
              },
              {
                icon: Truck,
                title: '58 wilayas, home or desk',
                arabicTitle: 'توصيل لـ 58 ولاية',
                text: 'توصيل لباب منزلك أو لمكتب الاستلام، شمالاً وجنوباً، مع أسعار واضحة ومحددة.'
              },
              {
                icon: PackageCheck,
                title: '48-hour size exchange',
                arabicTitle: 'استبدال خلال 48 ساعة',
                text: 'المقاس لم يناسبك؟ ننسق معك عملية الاستبدال بسرعة وبدون تعقيدات.'
              }
            ].map(({ icon: Icon, title, arabicTitle, text }, i) => (
              <div key={title} className={`border-b border-[#ded7e2] p-6 ${i % 2 === 0 ? 'sm:border-r' : ''}`}>
                <Icon size={20} strokeWidth={1.5} className="mb-6 text-[#7c3fb4]" />
                <h3 className="display-font text-lg font-bold text-[#2e2435]">{title}</h3>
                <p className="mt-1 text-xs font-bold text-[#7c3fb4]">{arabicTitle}</p>
                <p className="arabic mt-3 text-xs leading-6 text-[#766d7d]">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Customer Feedbacks Gallery */}
        <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mb-9 flex items-end justify-between">
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#7c3fb4]">Seen in the wild</p>
              <h2 className="display-font text-4xl font-bold tracking-[-.06em] text-[#281f30] sm:text-5xl">
                From the people<br />
                <span className="text-[#7c3fb4]">who got the piece.</span>
              </h2>
            </div>
            <a
              href="https://www.instagram.com/finalflash.8/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#857b8d] hover:text-[#7c3fb4]"
            >
              <Instagram size={14} /> @finalflash.8
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
            {feedbacks.map((item, index) => (
              <button
                key={item.image}
                onClick={() => setLightbox(index)}
                className="group relative aspect-[.78] overflow-hidden bg-[#2a2033] text-left"
                data-testid={`button-feedback-${index}`}
              >
                <ProductImage
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  fallbackLabel="REAL REVIEWS"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1e1526] to-transparent p-3 pt-10 text-white">
                  <p className="text-[10px] font-bold">{item.title}</p>
                  <p className="mt-1 text-[9px] text-[#dac3e8]">{item.tag}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="border-t border-[#e3dde7] bg-[#fbfafb] px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto grid max-w-[1100px] gap-12 lg:grid-cols-[.75fr_1.25fr]">
            <div>
              <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#7c3fb4]">
                <CircleHelp size={14} /> Need to know
              </p>
              <h2 className="display-font text-4xl font-bold leading-[.94] tracking-[-.06em] text-[#281f30] sm:text-5xl">
                Good questions<br />
                <span className="text-[#7c3fb4]">deserve answers.</span>
              </h2>
              <div className="mt-8 flex flex-col gap-3">
                <button
                  onClick={() => {
                    setGuideTab('jogger');
                    setGuideOpen(true);
                  }}
                  className="flex items-center gap-2 border-b border-[#bba5ca] pb-2 text-xs font-bold text-[#504558] hover:text-[#7c3fb4]"
                  data-testid="button-open-size-guide"
                >
                  <Ruler size={15} className="text-[#7c3fb4]" /> Open the size guide / دليل المقاسات
                </button>
                <button
                  onClick={() => {
                    setPolicyTab('delivery');
                    setPoliciesOpen(true);
                  }}
                  className="flex items-center gap-2 border-b border-[#bba5ca] pb-2 text-xs font-bold text-[#504558] hover:text-[#7c3fb4]"
                  data-testid="button-open-policies"
                >
                  <FileText size={15} className="text-[#7c3fb4]" /> Read our full store policies / السياسات الرسمية
                </button>
              </div>
            </div>

            <div>
              {[
                [
                  'كيف تتم عملية الطلب؟',
                  'تختار القطعة أو الطقم وتحدد المقاس واللون، ثم تضغط على إتمام الطلب وتملأ بياناتك (الاسم، الهاتف، الولاية، والبلدية). يُسجل طلبك برقم فريد ويفتح لك محادثة واتساب لنؤكد معك شخصياً تفاصيل الشحن قبل الإرسال.'
                ],
                [
                  'هل أستطيع فتح الطرد ومعاينته قبل دفع المال؟',
                  'نعم، 100%. يحق لك قانونياً مع Finalflash فتح الطرد وفحص جودة القطعة والمقاس أمام موزع التوصيل قبل دفع أي دينار. الدفع عند الاستلام بعد المعاينة.'
                ],
                [
                  'ما هي مدة وأسعار التوصيل لولايتي؟',
                  'نوصل إلى كافة الـ 58 ولاية. التوصيل للجزائر العاصمة خلال 24–48 ساعة (400 دج للمنزل / 250 دج للمكتب)، ولايات الشمال والوسط 24–72 ساعة (600 دج للمنزل / 400 دج للمكتب)، والهضاب والجنوب 2–4 أيام عمل.'
                ],
                [
                  'هل قطع الثريفت أصلية ونظيفة؟',
                  'نعم، ننتقي قطع الثريفت العالمية الأصلية بعين متخصصة (مثل Gymshark و Carhartt و Converse و Hard Rock)، ويتم فحص الخياطة والسحابات والنسيج يدوياً قطعة قطعة، ثم غسلها وتعقيمها باحترافية قبل عرضها.'
                ],
                [
                  'ماذا أفعل إن لم يناسبني المقاس؟',
                  'نوفر لك إمكانية استبدال المقاس خلال 48 ساعة من استلام الطرد بكل سهولة. تواصل معنا على واتساب مع رقم طلبك وسنرتب لك إرسال المقاس البديل فوراً.'
                ]
              ].map(([q, a], i) => (
                <div key={q} className="border-t border-[#ded7e2]">
                  <button
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-bold text-[#382d40]"
                    aria-expanded={faqOpen === i}
                    data-testid={`button-faq-${i}`}
                  >
                    <span>{q}</span>
                    <Plus size={17} className={`shrink-0 text-[#7c3fb4] transition-transform ${faqOpen === i ? 'rotate-45' : ''}`} />
                  </button>
                  {faqOpen === i && <p className="arabic max-w-[640px] pb-5 text-xs leading-7 text-[#746a7c]">{a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#241a30] px-5 py-12 text-[#c9bdcf] sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-[420px]">
            <div className="flex items-center gap-3">
              <img src="/images/logo.jpg" alt="Finalflash" className="h-10 w-10 rounded-full object-cover ring-1 ring-[#d8c3e5]" />
              <div className="display-font text-xl font-bold tracking-[-.05em] text-white">FINALFLASH</div>
            </div>
            <p className="arabic mt-4 text-xs leading-7 text-[#a99aad]">
              متجر ستريت وير وثريفت مستقل في الجزائر. نؤمن بأن القطعة النادرة تتحدث عن نفسها، وحق المشتري في المعاينة قبل الدفع هو أساس الثقة بيننا.
            </p>
            <div className="mt-5 flex items-center gap-3 text-xs text-[#d3a6f4]">
              <Truck size={14} /> تغطية شاملة لـ 58 ولاية جزائرية
            </div>
          </div>

          {/* Quick Links & Policies */}
          <div className="grid grid-cols-2 gap-8 text-xs sm:grid-cols-3">
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#d5b5f0]">Collection</p>
              <ul className="space-y-2 text-[#b0a3b6]">
                <li><a href="#collection" className="hover:text-white">All Pieces</a></li>
                <li><a href="#bundle-spotlight" className="hover:text-white">The Set Bundle</a></li>
                <li><a href="#story" className="hover:text-white">Our Standard</a></li>
                <li>
                  <button onClick={() => { setGuideTab('jogger'); setGuideOpen(true); }} className="hover:text-white">
                    Size Guide
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#d5b5f0]">Policies & Trust</p>
              <ul className="space-y-2 text-[#b0a3b6]">
                <li>
                  <button onClick={() => { setPolicyTab('delivery'); setPoliciesOpen(true); }} className="hover:text-white">
                    Shipping & Delivery
                  </button>
                </li>
                <li>
                  <button onClick={() => { setPolicyTab('cod'); setPoliciesOpen(true); }} className="hover:text-white">
                    Inspection & COD
                  </button>
                </li>
                <li>
                  <button onClick={() => { setPolicyTab('exchange'); setPoliciesOpen(true); }} className="hover:text-white">
                    48h Exchange
                  </button>
                </li>
                <li>
                  <button onClick={() => { setPolicyTab('authenticity'); setPoliciesOpen(true); }} className="hover:text-white">
                    Authenticity Standard
                  </button>
                </li>
                <li>
                  <button onClick={() => { setPolicyTab('privacy'); setPoliciesOpen(true); }} className="hover:text-white">
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#d5b5f0]">Contact & Orders</p>
              <ul className="space-y-2 text-[#b0a3b6]">
                <li>
                  <a
                    href="https://www.instagram.com/finalflash.8/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 hover:text-white"
                    data-testid="link-instagram"
                  >
                    <Instagram size={14} /> @finalflash.8
                  </a>
                </li>
                <li>
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 hover:text-white"
                    data-testid="link-whatsapp"
                  >
                    <Phone size={14} /> +213 778 65 96 40
                  </a>
                </li>
                {orders.length > 0 && (
                  <li>
                    <button onClick={() => setHistoryOpen(true)} className="flex items-center gap-1.5 text-[#d5b5f0] hover:text-white">
                      <History size={14} /> سجل طلباتي ({orders.length})
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 flex max-w-[1400px] flex-col items-center justify-between gap-4 border-t border-[#493951] pt-6 text-[10px] uppercase tracking-[.13em] text-[#86778d] sm:flex-row">
          <div>Finalflash — independent streetwear & thrift / Algeria · 2026</div>
          <div className="flex gap-4">
            <button onClick={() => { setPolicyTab('privacy'); setPoliciesOpen(true); }} className="hover:text-white">Privacy</button>
            <button onClick={() => { setPolicyTab('delivery'); setPoliciesOpen(true); }} className="hover:text-white">Delivery</button>
            <button onClick={() => { setPolicyTab('exchange'); setPoliciesOpen(true); }} className="hover:text-white">Exchange</button>
          </div>
        </div>
      </footer>

      {/* Floating Notice Toast */}
      {notice && (
        <div role="status" className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 border border-[#5e4470] bg-[#241a30] px-4 py-3 text-xs font-bold text-white shadow-2xl">
          {notice}
        </div>
      )}

      {/* Modals and Drawers */}
      {quickView && (
        <QuickView
          product={quickView}
          selectedSize={selectedSize}
          selectedColor={selectedColor}
          bundleJoggerColor={bundleJoggerColor}
          bundleJoggerSize={bundleJoggerSize}
          bundleTeeModel={bundleTeeModel}
          bundleTeeSize={bundleTeeSize}
          setSelectedSize={setSelectedSize}
          setSelectedColor={setSelectedColor}
          setBundleJoggerColor={setBundleJoggerColor}
          setBundleJoggerSize={setBundleJoggerSize}
          setBundleTeeModel={setBundleTeeModel}
          setBundleTeeSize={setBundleTeeSize}
          onClose={() => setQuickView(null)}
          onAdd={() => {
            if (quickView.isBundle) {
              addToCart(quickView, '', null, {
                joggerColor: bundleJoggerColor,
                joggerSize: bundleJoggerSize,
                teeModel: bundleTeeModel === 'gymshark' ? 'Gymshark 10/10' : 'Hard Rock Vintage',
                teeSize: bundleTeeSize
              });
            } else {
              addToCart(quickView, selectedSize, selectedColor);
            }
            setQuickView(null);
            setCartOpen(true);
          }}
          onGuide={() => {
            setGuideTab(quickView.category === 'shoes' ? 'shoes' : quickView.category === 'tshirts' ? 'tshirts' : 'jogger');
            setGuideOpen(true);
          }}
        />
      )}

      {cartOpen && (
        <CartDrawer
          cart={cart}
          itemCount={itemCount}
          subtotal={subtotal}
          onClose={() => setCartOpen(false)}
          onUpdate={updateQuantity}
          onRemove={removeCartItem}
          onCheckout={() => {
            setCartOpen(false);
            setCheckoutOpen(true);
          }}
          onOpenPolicies={() => {
            setPolicyTab('delivery');
            setPoliciesOpen(true);
          }}
        />
      )}

      {wishlistOpen && (
        <WishlistDrawer
          favorites={favorites}
          products={products}
          onClose={() => setWishlistOpen(false)}
          onRemove={toggleFavorite}
          onAddToCart={product => {
            if (product.isBundle) {
              openProduct(product);
              setWishlistOpen(false);
            } else {
              addToCart(product);
              setWishlistOpen(false);
              setCartOpen(true);
            }
          }}
        />
      )}

      {checkoutOpen && (
        <CheckoutModal
          cart={cart}
          subtotal={subtotal}
          onClose={() => setCheckoutOpen(false)}
          onBack={() => {
            setCheckoutOpen(false);
            setCartOpen(true);
          }}
          onOrderSuccess={recordOrder}
        />
      )}

      {policiesOpen && (
        <PoliciesModal tab={policyTab} setTab={setPolicyTab} onClose={() => setPoliciesOpen(false)} />
      )}

      {guideOpen && <SizeGuide tab={guideTab} setTab={setGuideTab} onClose={() => setGuideOpen(false)} />}

      {historyOpen && <OrderHistoryModal orders={orders} onClose={() => setHistoryOpen(false)} />}

      {lightbox !== null && (
        <Lightbox
          index={lightbox}
          onClose={() => setLightbox(null)}
          onMove={delta => setLightbox((lightbox + delta + feedbacks.length) % feedbacks.length)}
        />
      )}
    </div>
  );
}

function ProductCard({
  product,
  favorite,
  onFavorite,
  onOpen,
  onAdd,
  delay
}: {
  product: Product;
  favorite: boolean;
  onFavorite: () => void;
  onOpen: () => void;
  onAdd: () => void;
  delay: number;
}) {
  return (
    <article dir="ltr" className="group reveal" style={{ animationDelay: `${delay}ms` }} data-testid={`card-product-${product.id}`}>
      <div className="product-art relative aspect-[.78] cursor-pointer overflow-hidden bg-[#2a2033]" onClick={onOpen}>
        <ProductImage
          src={product.images[0]}
          alt={product.title}
          className="h-full w-full object-cover"
          fallbackLabel={product.category === 'bundle' ? 'THE SET' : 'FINALFLASH'}
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          <span className="w-max bg-[#241a30] px-2 py-1 text-[9px] font-bold tracking-[.12em] text-[#eadcf2]">
            {product.badge}
          </span>
          {product.stockCount <= 2 && (
            <span className="w-max bg-[#b35d4f] px-2 py-1 text-[9px] font-bold text-white">
              Only {product.stockCount} left
            </span>
          )}
        </div>
        <button
          onClick={e => {
            e.stopPropagation();
            onFavorite();
          }}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#f7f5f8]/90 text-[#48394e] hover:text-[#7c3fb4]"
          aria-label={favorite ? `Remove ${product.title} from favorites` : `Add ${product.title} to favorites`}
          data-testid={`button-favorite-${product.id}`}
        >
          <Heart size={15} fill={favorite ? 'currentColor' : 'none'} className={favorite ? 'text-[#7c3fb4]' : ''} />
        </button>
        <button
          onClick={e => {
            e.stopPropagation();
            onOpen();
          }}
          className="absolute bottom-3 left-3 right-3 hidden items-center justify-center gap-2 bg-[#f7f5f8]/95 py-3 text-[10px] font-bold text-[#2d2334] backdrop-blur-sm hover:bg-white sm:flex"
          data-testid={`button-quick-view-${product.id}`}
        >
          <Eye size={14} /> Quick view & Specs
        </button>
      </div>

      <div className="pt-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <button
              onClick={onOpen}
              dir="ltr"
              className="text-left display-font text-sm font-bold leading-tight text-[#302536] hover:text-[#7c3fb4]"
              data-testid={`button-title-${product.id}`}
            >
              {product.title}
            </button>
            <p dir="auto" className="mt-1 text-[10px] text-[#897f8e]">
              {product.sizes.join(' / ')} · {product.quality}
            </p>
          </div>
          <button
            onClick={onAdd}
            className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#d4cadb] text-[#7c3fb4] transition-colors hover:border-[#7c3fb4] hover:bg-[#7c3fb4] hover:text-white"
            aria-label={`Add ${product.title} to bag`}
            data-testid={`button-add-product-${product.id}`}
          >
            <Plus size={15} />
          </button>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <p dir="ltr" className="mono-font text-xs font-medium text-[#403345]">
            {formatPrice(product.price)}
          </p>
          {product.isBundle && (
            <span className="text-[10px] font-bold text-[#7c3fb4]">وفر 950 دج</span>
          )}
        </div>
      </div>
    </article>
  );
}

function ModalShell({
  children,
  onClose,
  labelledBy
}: {
  children: ReactNode;
  onClose: () => void;
  labelledBy?: string;
}) {
  useModalA11y(true, onClose);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[#1c1422]/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-enter relative max-h-[94dvh] w-full overflow-y-auto bg-[#fbfafb] shadow-2xl sm:max-w-[920px]">
        {children}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#f0ebf2] text-[#48394e] hover:bg-[#241a30] hover:text-white"
          aria-label="Close dialog"
          data-testid="button-close-dialog"
        >
          <X size={17} />
        </button>
      </div>
    </div>
  );
}

function QuickView({
  product,
  selectedSize,
  selectedColor,
  bundleJoggerColor,
  bundleJoggerSize,
  bundleTeeModel,
  bundleTeeSize,
  setSelectedSize,
  setSelectedColor,
  setBundleJoggerColor,
  setBundleJoggerSize,
  setBundleTeeModel,
  setBundleTeeSize,
  onClose,
  onAdd,
  onGuide
}: {
  product: Product;
  selectedSize: string;
  selectedColor: Color | null;
  bundleJoggerColor: string;
  bundleJoggerSize: string;
  bundleTeeModel: 'gymshark' | 'hardrock';
  bundleTeeSize: string;
  setSelectedSize: (s: string) => void;
  setSelectedColor: (c: Color) => void;
  setBundleJoggerColor: (c: string) => void;
  setBundleJoggerSize: (s: string) => void;
  setBundleTeeModel: (m: 'gymshark' | 'hardrock') => void;
  setBundleTeeSize: (s: string) => void;
  onClose: () => void;
  onAdd: () => void;
  onGuide: () => void;
}) {
  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [activeTab, setActiveTab] = useState<'details' | 'measurements' | 'care'>('details');

  return (
    <ModalShell onClose={onClose} labelledBy="quick-view-title">
      <div className="grid gap-7 p-5 pt-16 sm:grid-cols-2 sm:p-8">
        {/* Images Column */}
        <div>
          <div className="product-art aspect-[.84] overflow-hidden bg-[#2a2033]">
            <ProductImage src={activeImage} alt={product.title} className="h-full w-full object-cover" />
          </div>
          <div className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto">
            {product.images.map(src => (
              <button
                key={src}
                onClick={() => setActiveImage(src)}
                className={`h-16 w-14 shrink-0 overflow-hidden border-2 ${
                  activeImage === src ? 'border-[#7c3fb4]' : 'border-transparent opacity-60'
                }`}
                data-testid={`button-gallery-${src}`}
              >
                <ProductImage src={src} alt={`${product.title} view`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info Column */}
        <div className="flex flex-col pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[.2em] text-[#7c3fb4]">{product.badge}</span>
            <span className="rounded bg-[#241a30] px-2 py-0.5 text-[9px] font-bold text-[#e1d6e8]">{product.quality}</span>
          </div>

          <h2 id="quick-view-title" className="display-font mt-2 text-3xl font-bold leading-none tracking-[-.05em] text-[#2d2234]">
            {product.title}
          </h2>

          <div className="mt-4 flex items-center justify-between border-b border-[#e1d9e3] pb-4">
            <div className="flex items-baseline gap-2">
              <span className="mono-font text-xl font-bold text-[#7c3fb4]">{formatPrice(product.price)}</span>
              {product.isBundle && <span className="text-xs text-[#8c7e94] line-through">4,900 DA</span>}
            </div>
            <span className="flex items-center gap-1 text-xs text-[#766c7c]">
              <Star size={13} fill="#b47b27" className="text-[#b47b27]" /> {product.rating.toFixed(1)}
            </span>
          </div>

          <p className="arabic mt-4 text-xs leading-7 text-[#6a6070]">{product.description}</p>

          {/* Details & Measurements Tabs */}
          <div className="mt-4 border-b border-[#e1d9e3]">
            <div className="flex gap-4 text-xs font-bold">
              <button
                onClick={() => setActiveTab('details')}
                className={`border-b-2 pb-2 transition-colors ${
                  activeTab === 'details' ? 'border-[#7c3fb4] text-[#7c3fb4]' : 'border-transparent text-[#766b7c]'
                }`}
              >
                المواصفات
              </button>
              <button
                onClick={() => setActiveTab('measurements')}
                className={`border-b-2 pb-2 transition-colors ${
                  activeTab === 'measurements' ? 'border-[#7c3fb4] text-[#7c3fb4]' : 'border-transparent text-[#766b7c]'
                }`}
              >
                القياسات (cm)
              </button>
              <button
                onClick={() => setActiveTab('care')}
                className={`border-b-2 pb-2 transition-colors ${
                  activeTab === 'care' ? 'border-[#7c3fb4] text-[#7c3fb4]' : 'border-transparent text-[#766b7c]'
                }`}
              >
                القماش والعناية
              </button>
            </div>
          </div>

          <div className="py-3">
            {activeTab === 'details' && (
              <div className="space-y-1.5">
                {product.features.map(f => (
                  <p key={f} className="arabic flex items-start gap-2 text-[11px] text-[#62586a]">
                    <Check size={13} className="mt-0.5 shrink-0 text-[#7c3fb4]" />
                    <span>{f}</span>
                  </p>
                ))}
              </div>
            )}

            {activeTab === 'measurements' && (
              <div className="space-y-2">
                <table className="w-full text-xs">
                  <tbody>
                    {product.measurements.map(m => (
                      <tr key={m.label} className="border-b border-[#ebe5ee]">
                        <td className="py-1.5 font-bold text-[#44384a]">{m.label}:</td>
                        <td dir="auto" className="py-1.5 text-[#6c6172]">{m.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-3 rounded border border-[#e2d8e8] bg-[#f9f5fb] p-2.5 text-[10px] leading-5 text-[#6c5b76]">
                  <p className="font-bold text-[#7c3fb4]">معاينة المقاس قبل الدفع:</p>
                  <p>{honestMeasurementNotice}</p>
                </div>
              </div>
            )}

            {activeTab === 'care' && (
              <div className="space-y-2 text-[11px] text-[#62586a]">
                <p><strong>الخامة:</strong> {product.fabric}</p>
                <p><strong>نوع القصة:</strong> {product.fit}</p>
                <p><strong>طريقة الغسيل:</strong> {product.care}</p>
              </div>
            )}
          </div>

          {/* Bundle Customizer or Standard Picker */}
          {product.isBundle ? (
            <div className="mt-3 space-y-4 rounded border border-[#d8c5e6] bg-[#f6f0fa] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[.1em] text-[#7c3fb4]">
                تخصيص الطقم الكامل (Save 950 DA):
              </p>

              {/* 1. Jogger Selection */}
              <div>
                <label className="block text-xs font-bold text-[#3d2e46]">
                  1. بنطال الـ Baggy Jogger
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['Black', 'Grey'].map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => {
                        setBundleJoggerColor(col);
                        setActiveImage(col === 'Black' ? 'jogger-black.jpg' : 'jogger-grey.jpg');
                      }}
                      className={`border px-3 py-1.5 text-xs font-bold transition-colors ${
                        bundleJoggerColor === col
                          ? 'border-[#7c3fb4] bg-[#7c3fb4] text-white'
                          : 'border-[#d0c6d5] bg-white text-[#554a5c]'
                      }`}
                    >
                      {col === 'Black' ? 'أسود (Black)' : 'رمادي (Grey)'}
                    </button>
                  ))}
                  <div className="mx-1 h-6 w-px bg-[#d0c6d5]" />
                  {['M', 'L', 'XL'].map(sz => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setBundleJoggerSize(sz)}
                      className={`border px-2.5 py-1.5 text-xs font-bold transition-colors ${
                        bundleJoggerSize === sz
                          ? 'border-[#241c2c] bg-[#241c2c] text-white'
                          : 'border-[#d0c6d5] bg-white text-[#554a5c]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Tee Selection */}
              <div>
                <label className="block text-xs font-bold text-[#3d2e46]">
                  2. التيشيرت المختار مع الطقم
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBundleTeeModel('gymshark');
                      setBundleTeeSize('S');
                      setActiveImage('gymshark-front.jpg');
                    }}
                    className={`border p-2.5 text-left text-xs transition-colors ${
                      bundleTeeModel === 'gymshark'
                        ? 'border-[#7c3fb4] bg-white ring-1 ring-[#7c3fb4]'
                        : 'border-[#d0c6d5] bg-white/70'
                    }`}
                  >
                    <span className="block font-bold text-[#2d2134]">Gymshark 10/10</span>
                    <span className="text-[10px] text-[#7b6f82]">Black / مقاس S</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBundleTeeModel('hardrock');
                      setBundleTeeSize('M');
                      setActiveImage('hardrock-front.jpg');
                    }}
                    className={`border p-2.5 text-left text-xs transition-colors ${
                      bundleTeeModel === 'hardrock'
                        ? 'border-[#7c3fb4] bg-white ring-1 ring-[#7c3fb4]'
                        : 'border-[#d0c6d5] bg-white/70'
                    }`}
                  >
                    <span className="block font-bold text-[#2d2134]">Hard Rock Vintage</span>
                    <span className="text-[10px] text-[#7b6f82]">Blue / مقاس M</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Standard Size Picker */}
              <div className="mt-3">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-bold text-[#473a4d]">
                    Size <span className="text-[#7c3fb4]">{selectedSize}</span>
                  </label>
                  <button
                    onClick={onGuide}
                    className="flex items-center gap-1 text-[10px] font-bold text-[#7c3fb4] underline underline-offset-2"
                    data-testid="button-quickview-size-guide"
                  >
                    <Ruler size={13} /> Size guide
                  </button>
                </div>
                <div className="flex gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-12 border px-3 py-2 text-xs font-bold ${
                        selectedSize === size
                          ? 'border-[#7c3fb4] bg-[#7c3fb4] text-white'
                          : 'border-[#d8cfdb] text-[#62586a] hover:border-[#7c3fb4]'
                      }`}
                      data-testid={`button-size-${size}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Standard Color Picker */}
              {product.colors.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-bold text-[#473a4d]">
                    Color <span className="font-normal text-[#7c3fb4]">{selectedColor?.name}</span>
                  </p>
                  <div className="flex gap-2">
                    {product.colors.map(color => (
                      <button
                        key={color.name}
                        onClick={() => {
                          setSelectedColor(color);
                          if (color.image) setActiveImage(color.image);
                        }}
                        className={`h-7 w-7 rounded-full border-2 ${
                          selectedColor?.name === color.name
                            ? 'border-[#7c3fb4] ring-2 ring-[#d8b8ed] ring-offset-2 ring-offset-[#fbfafb]'
                            : 'border-white shadow-sm'
                        }`}
                        style={{ background: color.hex }}
                        aria-label={`Select ${color.name}`}
                        data-testid={`button-color-${color.name}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Add to Bag CTA */}
          <button
            onClick={onAdd}
            disabled={!product.inStock}
            className="mt-6 flex w-full items-center justify-center gap-2 bg-[#241c2c] py-4 text-xs font-bold text-white transition-colors hover:bg-[#7c3fb4] disabled:cursor-not-allowed disabled:opacity-40"
            data-testid="button-quickview-add"
          >
            <ShoppingBag size={15} /> Add to bag / أضف إلى السلة
          </button>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] text-[#8a808f]">
            <Eye size={12} className="text-[#7c3fb4]" /> معاينة قبل الدفع — الدفع عند الاستلام نقداً
          </p>
        </div>
      </div>
    </ModalShell>
  );
}

function CartDrawer({
  cart,
  itemCount,
  subtotal,
  onClose,
  onUpdate,
  onRemove,
  onCheckout,
  onOpenPolicies
}: {
  cart: CartItem[];
  itemCount: number;
  subtotal: number;
  onClose: () => void;
  onUpdate: (i: number, d: number) => void;
  onRemove: (i: number) => void;
  onCheckout: () => void;
  onOpenPolicies: () => void;
}) {
  useModalA11y(true, onClose);

  return (
    <div
      className="fixed inset-0 z-[60] bg-[#1c1422]/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside className="drawer-enter ml-auto flex h-full w-full max-w-[460px] flex-col bg-[#fbfafb] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e1d9e3] px-5 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#7c3fb4]">Your selection</p>
            <h2 className="display-font mt-1 text-2xl font-bold tracking-[-.05em] text-[#2d2234]">
              Bag <span className="text-sm font-normal text-[#8b8290]">({itemCount})</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eee8f0] text-[#48394e] hover:bg-[#241a30] hover:text-white"
            aria-label="Close bag"
            data-testid="button-close-cart"
          >
            <X size={17} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <ShoppingBag size={32} className="mb-5 text-[#9e91a8]" />
            <h3 className="display-font text-xl font-bold text-[#34283a]">Your bag is quiet.</h3>
            <p className="arabic mt-2 text-sm text-[#7a707f]">سلتك فارغة حالياً. تصفح التشكيلة واختر ما يناسب ذوقك.</p>
            <button
              onClick={onClose}
              className="mt-6 bg-[#241c2c] px-6 py-3 text-xs font-bold text-white transition-colors hover:bg-[#7c3fb4]"
              data-testid="button-continue-shopping"
            >
              Continue shopping / تصفح التشكيلة
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {cart.map((item, i) => (
                <div
                  key={`${item.product.id}-${item.size}-${item.color?.name}-${i}`}
                  className="flex gap-3 border-b border-[#e5dee7] py-4 first:pt-0"
                >
                  <div className="h-24 w-20 shrink-0 overflow-hidden bg-[#2a2033]">
                    <ProductImage
                      src={item.color?.image || item.product.images[0]}
                      alt={item.product.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2">
                      <h3 className="display-font text-sm font-bold text-[#382b3f]">{item.product.title}</h3>
                      <button
                        onClick={() => onRemove(i)}
                        className="text-[#978d9c] hover:text-[#b35d4f]"
                        aria-label={`Remove ${item.product.title}`}
                        data-testid={`button-remove-cart-${item.product.id}`}
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {item.bundleOptions ? (
                      <div className="mt-1 space-y-0.5 text-[10px] text-[#716478]">
                        <p>• Jogger: {item.bundleOptions.joggerColor} · Size {item.bundleOptions.joggerSize}</p>
                        <p>• Tee: {item.bundleOptions.teeModel} · Size {item.bundleOptions.teeSize}</p>
                      </div>
                    ) : (
                      <p className="mt-1 text-[10px] text-[#867b8c]">
                        {item.size} · {item.color?.name}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center border border-[#d8cfdb]">
                        <button
                          onClick={() => onUpdate(i, -1)}
                          className="p-1.5 hover:bg-[#eee8f0]"
                          aria-label="Decrease quantity"
                          data-testid={`button-decrease-${item.product.id}`}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-7 text-center text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => onUpdate(i, 1)}
                          className="p-1.5 hover:bg-[#eee8f0]"
                          aria-label="Increase quantity"
                          data-testid={`button-increase-${item.product.id}`}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="mono-font text-xs font-medium text-[#48384e]">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#ddd5e0] bg-[#f3eef4] p-5">
              <div className="flex items-center justify-between text-sm font-bold text-[#3c3042]">
                <span>Subtotal / المجموع الأولي</span>
                <span className="mono-font text-base text-[#7c3fb4]">{formatPrice(subtotal)}</span>
              </div>
              <p className="arabic mt-2 text-[10px] leading-5 text-[#837888]">
                تكلفة التوصيل تُحسب حسب ولايتك في الخطوة التالية. الدفع عند الاستلام مع حق المعاينة قبل الدفع.
              </p>
              <button
                onClick={onCheckout}
                className="mt-4 flex w-full items-center justify-center gap-2 bg-[#241c2c] py-4 text-xs font-bold text-white transition-colors hover:bg-[#7c3fb4]"
                data-testid="button-proceed-checkout"
              >
                Delivery details / إتمام تفاصيل التوصيل <ArrowRight size={15} />
              </button>
              <div className="mt-3 text-center">
                <button
                  onClick={onOpenPolicies}
                  className="text-[10px] text-[#716578] underline decoration-[#c6bcc9] underline-offset-2 hover:text-[#7c3fb4]"
                >
                  عرض شروط المعاينة والاستبدال لـ 58 ولاية
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function WishlistDrawer({
  favorites,
  products,
  onClose,
  onRemove,
  onAddToCart
}: {
  favorites: number[];
  products: Product[];
  onClose: () => void;
  onRemove: (id: number) => void;
  onAddToCart: (p: Product) => void;
}) {
  const list = products.filter(p => favorites.includes(p.id));
  useModalA11y(true, onClose);

  return (
    <div
      className="fixed inset-0 z-[60] bg-[#1c1422]/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside className="drawer-enter ml-auto flex h-full w-full max-w-[460px] flex-col bg-[#fbfafb] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e1d9e3] px-5 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#7c3fb4]">Saved pieces</p>
            <h2 className="display-font mt-1 text-2xl font-bold tracking-[-.05em] text-[#2d2234]">
              Wishlist <span className="text-sm font-normal text-[#8b8290]">({list.length})</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eee8f0] text-[#48394e] hover:bg-[#241a30] hover:text-white"
            aria-label="Close wishlist"
          >
            <X size={17} />
          </button>
        </div>

        {list.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <Heart size={32} className="mb-5 text-[#9e91a8]" />
            <h3 className="display-font text-xl font-bold text-[#34283a]">No pieces saved yet.</h3>
            <p className="arabic mt-2 text-sm text-[#7a707f]">
              اضغط على رمز القلب عند أي قطعة لإضافتها إلى قائمة مفضلتك والرجوع إليها لاحقاً.
            </p>
            <button
              onClick={onClose}
              className="mt-6 bg-[#241c2c] px-6 py-3 text-xs font-bold text-white transition-colors hover:bg-[#7c3fb4]"
            >
              Discover pieces / استكشف القطع
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {list.map(product => (
              <div key={product.id} className="flex gap-3 border-b border-[#e5dee7] py-4 first:pt-0">
                <div className="h-24 w-20 shrink-0 overflow-hidden bg-[#2a2033]">
                  <ProductImage src={product.images[0]} alt={product.title} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2">
                    <h3 className="display-font text-sm font-bold text-[#382b3f]">{product.title}</h3>
                    <button
                      onClick={() => onRemove(product.id)}
                      className="text-[#978d9c] hover:text-[#b35d4f]"
                      aria-label="Remove from wishlist"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className="mt-1 text-[10px] text-[#867b8c]">{product.quality}</p>
                  <p className="mono-font mt-2 text-xs font-medium text-[#48384e]">{formatPrice(product.price)}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => onAddToCart(product)}
                      className="flex items-center gap-1 bg-[#241c2c] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#7c3fb4]"
                    >
                      <ShoppingBag size={12} /> Add to bag
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}

function CheckoutModal({
  cart,
  subtotal,
  onClose,
  onBack,
  onOrderSuccess
}: {
  cart: CartItem[];
  subtotal: number;
  onClose: () => void;
  onBack: () => void;
  onOrderSuccess: (order: OrderRecord) => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [commune, setCommune] = useState('');
  const [delivery, setDelivery] = useState<'home' | 'desk'>('home');
  const [orderNumber, setOrderNumber] = useState('');
  const [sent, setSent] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [copied, setCopied] = useState(false);

  const createOrder = useCreateOrder();
  const deliveryFee = calculateDeliveryFee(wilaya, delivery);
  const total = subtotal + deliveryFee;

  const phoneCheck = normalizeAlgerianPhone(phone);
  const isFormValid = name.trim().length >= 2 && phoneCheck.valid && wilaya.length > 0 && commune.trim().length >= 2;

  function buildWhatsAppMessage(ordNum: string): string {
    const itemLines = cart
      .map(item => {
        if (item.bundleOptions) {
          return `• طقم The Finalflash Set: جوغر (${item.bundleOptions.joggerColor} / ${item.bundleOptions.joggerSize}) + تيشيرت (${item.bundleOptions.teeModel} / ${item.bundleOptions.teeSize}) x${item.quantity} (${formatPrice(item.product.price * item.quantity)})`;
        }
        return `• ${item.product.title} / ${item.size} / ${item.color?.name || 'Standard'} x${item.quantity} (${formatPrice(item.product.price * item.quantity)})`;
      })
      .join('\n');

    return (
      `سلام Finalflash، أود تأكيد طلبي برقم ${ordNum}:\n\n` +
      `📦 تفاصيل المشتريات:\n${itemLines}\n\n` +
      `💵 الحساب:\n` +
      `- ثمن القطع: ${formatPrice(subtotal)}\n` +
      `- تكلفة التوصيل: ${formatPrice(deliveryFee)} (${delivery === 'home' ? 'لباب المنزل' : 'استلام من المكتب'})\n` +
      `- المجموع الإجمالي: ${formatPrice(total)}\n\n` +
      `📍 معلومات الزبون:\n` +
      `- الاسم: ${name.trim()}\n` +
      `- الهاتف: ${phoneCheck.normalized}\n` +
      `- الولاية: ${wilaya}\n` +
      `- البلدية / العنوان: ${commune.trim()}\n` +
      `- طريقة الاستلام: ${delivery === 'home' ? 'توصيل للباب (À domicile)' : 'استلام من المكتب (Stop desk)'}\n\n` +
      `أنتظر تأكيدكم لتجهيز الشحنة. شكراً!`
    );
  }

  async function handleSendOrder() {
    if (!isFormValid || createOrder.isPending) return;
    setOrderError('');

    const localOrdNum = generateLocalOrderNumber();
    const whatsappWindow = window.open('', '_blank');

    const orderPayload = {
      customerName: name.trim(),
      phone: phoneCheck.normalized,
      wilaya,
      commune: commune.trim(),
      deliveryMethod: delivery,
      subtotal,
      deliveryFee,
      total,
      items: cart.map(item => ({
        productId: item.product.id,
        productTitle: item.bundleOptions
          ? `The Finalflash Set [${item.bundleOptions.joggerColor}/${item.bundleOptions.joggerSize} + ${item.bundleOptions.teeModel}]`
          : item.product.title,
        size: item.size,
        color: item.color?.name || null,
        quantity: item.quantity,
        unitPrice: item.product.price
      }))
    };

    const finalRecord: OrderRecord = {
      orderNumber: localOrdNum,
      date: new Date().toLocaleDateString('ar-DZ', { year: 'numeric', month: 'short', day: 'numeric' }),
      customerName: name.trim(),
      phone: phoneCheck.normalized,
      wilaya,
      commune: commune.trim(),
      deliveryMethod: delivery === 'home' ? 'توصيل للباب' : 'استلام من المكتب',
      subtotal,
      deliveryFee,
      total,
      items: orderPayload.items
    };

    try {
      const res = await createOrder.mutateAsync({ data: orderPayload });
      const actualOrderNumber = res.orderNumber || localOrdNum;
      finalRecord.orderNumber = actualOrderNumber;
      setOrderNumber(actualOrderNumber);

      const msg = buildWhatsAppMessage(actualOrderNumber);
      const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
      if (whatsappWindow) {
        whatsappWindow.location.href = waUrl;
      } else {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }

      onOrderSuccess(finalRecord);
      setSent(true);
    } catch (err: any) {
      if (whatsappWindow) {
        whatsappWindow.close();
      }
      const apiMsg = err?.response?.data?.error || err?.message || 'تعذر الاتصال بقاعدة البيانات لحفظ الطلب تلقائياً.';
      setOrderError(apiMsg);
    }
  }

  function handleDirectWhatsAppFallback() {
    const localOrdNum = generateLocalOrderNumber();
    const finalRecord: OrderRecord = {
      orderNumber: localOrdNum,
      date: new Date().toLocaleDateString('ar-DZ', { year: 'numeric', month: 'short', day: 'numeric' }),
      customerName: name.trim(),
      phone: phoneCheck.normalized,
      wilaya,
      commune: commune.trim(),
      deliveryMethod: delivery === 'home' ? 'توصيل للباب' : 'استلام من المكتب',
      subtotal,
      deliveryFee,
      total,
      items: cart.map(item => ({
        productId: item.product.id,
        productTitle: item.bundleOptions
          ? `The Finalflash Set [${item.bundleOptions.joggerColor}/${item.bundleOptions.joggerSize} + ${item.bundleOptions.teeModel}]`
          : item.product.title,
        size: item.size,
        color: item.color?.name || null,
        quantity: item.quantity,
        unitPrice: item.product.price
      }))
    };
    setOrderNumber(localOrdNum);
    const msg = buildWhatsAppMessage(localOrdNum) + '\n(تنبيه: تم إرسال هذا الطلب مباشرة عبر واتساب لتأكيده يدوياً مع المشرف)';
    const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    onOrderSuccess(finalRecord);
    setSent(true);
  }

  function copyOrderNumber() {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <ModalShell onClose={onClose} labelledBy="checkout-title">
      <div className="p-5 pt-16 sm:p-8 sm:pt-16">
        {!sent && (
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-1 text-xs font-bold text-[#7c3fb4]"
            data-testid="button-back-to-cart"
          >
            <ChevronLeft size={15} /> Back to bag / العودة للسلة
          </button>
        )}

        {sent ? (
          /* Confirmation View */
          <div className="py-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eff8f0] text-[#2d7738]">
              <CheckCircle2 size={36} />
            </div>

            <h2 className="display-font mt-4 text-3xl font-bold tracking-tight text-[#2d2234]">
              تم تسجيل طلبك بنجاح!
            </h2>
            <p className="arabic mt-2 text-sm text-[#665a6c]">
              رقم طلبك المرجعي لدى Finalflash هو:
            </p>

            <div className="mx-auto mt-4 flex max-w-sm items-center justify-between border-2 border-dashed border-[#7c3fb4] bg-[#f8f4fb] px-5 py-3">
              <span className="mono-font text-xl font-bold tracking-wider text-[#7c3fb4]">{orderNumber}</span>
              <button
                onClick={copyOrderNumber}
                className="flex items-center gap-1 text-xs font-bold text-[#352541] hover:text-[#7c3fb4]"
              >
                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                <span>{copied ? 'تم النسخ' : 'نسخ الرقم'}</span>
              </button>
            </div>

            <div className="arabic mx-auto mt-6 max-w-md rounded-lg border border-[#ded5e4] bg-white p-5 text-right text-xs leading-6 text-[#5f5466] shadow-sm">
              <p className="font-bold text-[#322339]">ما هي الخطوة القادمة؟</p>
              <ol className="mt-2 list-decimal space-y-2 pr-4">
                <li>تم فتح تطبيق واتساب تلقائياً لإرسال بيانات الطلب لفريقنا.</li>
                <li>سنتواصل معك عبر واتساب لتأكيد المقاس المختار ونوع التيشيرت وموعد خروج الشحنة.</li>
                <li>يصلك الموزع حتى باب دارك أو لمكتب ولايتك مع حق فتح الطرد وفحصه كاملاً قبل دفع الدينار.</li>
              </ol>
            </div>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(buildWhatsAppMessage(orderNumber))}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-[#25D366] px-6 py-3.5 text-xs font-bold text-white transition-colors hover:bg-[#20ba59]"
              >
                <Phone size={15} /> فتح محادثة واتساب الآن لتأكيد الطلب
              </a>

              <button
                onClick={onClose}
                className="border border-[#d0c6d5] bg-white px-6 py-3.5 text-xs font-bold text-[#45374e] hover:bg-[#f1eaf4]"
              >
                متابعة التسوق في المتجر
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#7c3fb4]">WhatsApp checkout</p>
              <h2 id="checkout-title" className="display-font mt-2 text-3xl font-bold tracking-[-.06em] text-[#2d2234] sm:text-4xl">
                Where should<br />
                <span className="text-[#7c3fb4]">we send it?</span>
              </h2>
              <p className="arabic mt-3 text-xs leading-7 text-[#746a7c]">
                أدخل تفاصيل التوصيل. سنحفظ طلبك برقم رسمي ونفتح لك واتساب لتأكيد المقاسات معك شخصياً قبل شحن الطرد.
              </p>

              {orderError && (
                <div role="alert" className="mt-4 rounded border border-[#e1b8b2] bg-[#fff3f1] p-4 text-xs text-[#9b3f34]">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold">تنبيه في اتصال السيرفر:</p>
                      <p className="mt-1 leading-5">{orderError}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-[#f7d6d1] pt-3">
                    <button
                      type="button"
                      onClick={handleSendOrder}
                      disabled={createOrder.isPending}
                      className="rounded bg-[#9b3f34] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#7e3026]"
                    >
                      {createOrder.isPending ? 'جاري المحاولة...' : 'إعادة محاولة الحفظ السحابي'}
                    </button>
                    <button
                      type="button"
                      onClick={handleDirectWhatsAppFallback}
                      className="rounded border border-[#9b3f34] px-3.5 py-1.5 text-xs font-bold text-[#9b3f34] hover:bg-[#9b3f34] hover:text-white"
                    >
                      تأكيد يدوي فوري عبر واتساب
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-4">
                <label className="block text-xs font-bold text-[#4c3e52]">
                  Full name / الاسم الكامل *
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="mt-1.5 w-full border border-[#d8cfdb] bg-white px-3 py-3 text-sm outline-none focus:border-[#7c3fb4]"
                    placeholder="مثال: أمين بن علي"
                    data-testid="input-checkout-name"
                  />
                </label>

                <div>
                  <label className="block text-xs font-bold text-[#4c3e52]">
                    Phone number / رقم الهاتف الجزائري *
                    <input
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      type="tel"
                      dir="ltr"
                      className={`mt-1.5 w-full border bg-white px-3 py-3 text-sm outline-none ${
                        phone.length > 3 && !phoneCheck.valid ? 'border-[#c45347] focus:border-[#c45347]' : 'border-[#d8cfdb] focus:border-[#7c3fb4]'
                      }`}
                      placeholder="05 / 06 / 07 xx xx xx xx"
                      data-testid="input-checkout-phone"
                    />
                  </label>
                  {phone.length > 3 && !phoneCheck.valid && (
                    <span className="mt-1 block text-[10px] text-[#b34033]">
                      يرجى إدخال رقم هاتف جزائري يبدأ بـ 05 أو 06 أو 07 مكون من 10 أرقام.
                    </span>
                  )}
                </div>

                <label className="block text-xs font-bold text-[#4c3e52]">
                  Wilaya / الولاية *
                  <select
                    value={wilaya}
                    onChange={e => setWilaya(e.target.value)}
                    className="mt-1.5 w-full border border-[#d8cfdb] bg-white px-3 py-3 text-sm outline-none focus:border-[#7c3fb4]"
                    data-testid="select-checkout-wilaya"
                  >
                    <option value="">Choose your wilaya — 58 available</option>
                    {wilayas.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </label>

                <label className="block text-xs font-bold text-[#4c3e52]">
                  Commune & Address / البلدية والعنوان بالتفصيل *
                  <input
                    value={commune}
                    onChange={e => setCommune(e.target.value)}
                    className="mt-1.5 w-full border border-[#d8cfdb] bg-white px-3 py-3 text-sm outline-none focus:border-[#7c3fb4]"
                    placeholder="مثال: القبة، حي 5 جويلية، بجانب البريد"
                    data-testid="input-checkout-commune"
                  />
                </label>

                <fieldset>
                  <legend className="mb-2 text-xs font-bold text-[#4c3e52]">
                    Delivery method / طريقة الاستلام
                  </legend>
                  <div className="grid grid-cols-2 gap-2">
                    <label
                      className={`cursor-pointer border p-3 text-xs transition-colors ${
                        delivery === 'home' ? 'border-[#7c3fb4] bg-[#f1e9f5]' : 'border-[#d8cfdb] bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        checked={delivery === 'home'}
                        onChange={() => setDelivery('home')}
                        className="sr-only"
                      />
                      <span className="block font-bold">Home delivery</span>
                      <span className="mt-0.5 block text-[10px] text-[#817687]">لباب الدار</span>
                    </label>

                    <label
                      className={`cursor-pointer border p-3 text-xs transition-colors ${
                        delivery === 'desk' ? 'border-[#7c3fb4] bg-[#f1e9f5]' : 'border-[#d8cfdb] bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        checked={delivery === 'desk'}
                        onChange={() => setDelivery('desk')}
                        className="sr-only"
                      />
                      <span className="block font-bold">Desk delivery</span>
                      <span className="mt-0.5 block text-[10px] text-[#817687]">استلام من المكتب (سعر أقل)</span>
                    </label>
                  </div>
                </fieldset>
              </div>
            </div>

            {/* Order Summary Column */}
            <div className="flex h-max flex-col justify-between bg-[#f2edf3] p-5 sm:p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#837689]">Order summary</p>
                <div className="mt-4 divide-y divide-[#ded5e1]">
                  {cart.map((item, idx) => (
                    <div key={`${item.product.id}-${idx}`} className="py-2.5 text-xs first:pt-0">
                      <div className="flex justify-between gap-3">
                        <span className="font-semibold text-[#4e4254]">
                          {item.product.title} × {item.quantity}
                        </span>
                        <span className="mono-font text-[#403345]">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                      {item.bundleOptions ? (
                        <p className="mt-0.5 text-[10px] text-[#786b7f]">
                          Jogger: {item.bundleOptions.joggerColor}/{item.bundleOptions.joggerSize} + Tee: {item.bundleOptions.teeModel}
                        </p>
                      ) : (
                        <p className="mt-0.5 text-[10px] text-[#786b7f]">
                          Size: {item.size} {item.color?.name ? `· Color: ${item.color.name}` : ''}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-5 border-t border-[#d9cfdd] pt-4 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#685d6e]">ثمن المشتريات (Subtotal)</span>
                    <span className="mono-font font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#685d6e]">
                    <span>سعر التوصيل ({delivery === 'home' ? 'لباب الدار' : 'للمكتب'})</span>
                    <span className="mono-font">
                      {wilaya ? formatPrice(deliveryFee) : 'اختر الولاية لحساب التوصيل'}
                    </span>
                  </div>
                  <div className="mt-3 flex justify-between border-t border-[#d9cfdd] pt-3 text-sm font-bold">
                    <span>المجموع الإجمالي (Total)</span>
                    <span className="mono-font text-base text-[#7c3fb4]">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleSendOrder}
                  disabled={!isFormValid || createOrder.isPending}
                  className="flex w-full items-center justify-center gap-2 bg-[#7c3fb4] py-4 text-xs font-bold text-white transition-colors hover:bg-[#241c2c] disabled:cursor-not-allowed disabled:opacity-40"
                  data-testid="button-send-whatsapp"
                >
                  {createOrder.isPending ? 'جاري تسجيل الطلب...' : 'تأكيد وإرسال الطلب عبر واتساب'} <ArrowRight size={15} />
                </button>

                <div className="arabic mt-4 flex items-start gap-2 text-[10px] leading-5 text-[#7f7485]">
                  <ShieldCheck size={14} className="mt-0.5 shrink-0 text-[#7c3fb4]" />
                  <span>
                    لا يوجد أي دفع مسبق. الدفع نقداً عند الاستلام بعد فتح الطرد ومعاينة القطع والتأكد من مطابقتها.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function PoliciesModal({
  tab,
  setTab,
  onClose
}: {
  tab: string;
  setTab: (t: string) => void;
  onClose: () => void;
}) {
  return (
    <ModalShell onClose={onClose} labelledBy="policies-title">
      <div className="p-5 pt-16 sm:p-8 sm:pt-16">
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#7c3fb4]">Store Trust & Legal</p>
        <h2 id="policies-title" className="display-font mt-2 text-3xl font-bold tracking-[-.06em] text-[#2d2234] sm:text-4xl">
          السياسات والضمانات التجارية
        </h2>
        <p className="arabic mt-2 text-xs text-[#716677]">
          كل ما تحتاج معرفته عن التوصيل، المعاينة قبل الدفع، الاستبدال، وحماية الخصوصية في متجر Finalflash.
        </p>

        {/* Policy Tabs */}
        <div className="hide-scrollbar mt-6 flex overflow-x-auto border-b border-[#ded5e1]">
          {[
            { id: 'delivery', label: 'التوصيل والشحن (58 ولاية)' },
            { id: 'cod', label: 'المعاينة قبل الدفع' },
            { id: 'exchange', label: 'الاستبدال خلال 48 ساعة' },
            { id: 'authenticity', label: 'معايير الثريفت والأصالة' },
            { id: 'privacy', label: 'الخصوصية والأمان' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setTab(p.id)}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
                tab === p.id ? 'border-[#7c3fb4] text-[#7c3fb4]' : 'border-transparent text-[#7e7383] hover:text-[#2d2234]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="arabic mt-6 max-h-[55vh] overflow-y-auto pr-1 text-xs leading-7 text-[#5d5263]">
          {tab === 'delivery' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#322339]">🚚 سياسة التوصيل والشحن لـ 58 ولاية</h3>
              <p>
                نلتزم في Finalflash بتوصيل طلبك أينما كنت في الجزائر، بالتعاون مع أفضل وأسرع شركات التوصيل المعتمدة (توصيل للمنزل أو استلام من مكتب الولاية).
              </p>
              <div className="rounded border border-[#e2dbe6] bg-[#f9f7fa] p-4 space-y-2">
                <p><strong>الجزائر العاصمة (ولاية 16):</strong> 24 إلى 48 ساعة (400 دج للمنزل / 250 دج للمكتب).</p>
                <p><strong>ولايات الشمال والوسط والغرب والشرق:</strong> 24 إلى 72 ساعة (600 دج للمنزل / 400 دج للمكتب).</p>
                <p><strong>ولايات الهضاب العليا:</strong> 48 إلى 72 ساعة (700 دج للمنزل / 450 دج للمكتب).</p>
                <p><strong>ولايات الجنوب والصحراء:</strong> 2 إلى 4 أيام عمل (950 دج للمنزل / 650 دج للمكتب).</p>
              </div>
              <p>
                يتصل بك موزع التوصيل هاتفياً في يوم التسليم لتحديد الوقت المناسب. كما نزودك برقم تتبع ومتابعة مباشرة عبر واتساب.
              </p>
            </div>
          )}

          {tab === 'cod' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#322339]">🔍 المعاينة قبل الدفع والدفع عند الاستلام (COD)</h3>
              <p>
                في Finalflash، مبدأنا هو <strong>الثقة المتبادلة والصدق</strong>. لا نطلب منك أي تسبيق أو دفع بنكي مسبق قبل أن تمسك القطعة بيدك.
              </p>
              <ul className="list-disc space-y-2 pr-5">
                <li>يحق لك تماماً فتح الطرد وفحص جودة النسيج، خلوه من أي عيوب، والتأكد من مطابقة المقاس واللون المختار.</li>
                <li>يتم الدفع نقداً للموزع بعد رضاك التام عن محتوى الطرد.</li>
                <li>في حال وجود أي عدم مطابقة عما تم الاتفاق عليه، يحق لك رفض الاستلام فوراً دون أي إحراج.</li>
              </ul>
            </div>
          )}

          {tab === 'exchange' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#322339]">🔄 سياسة الاستبدال خلال 48 ساعة</h3>
              <p>
                إذا استلمت القطعة ووجدت أن المقاس غير مناسب تماماً، نوفر لك خدمة استبدال المقاس بكل سلاسة:
              </p>
              <ul className="list-disc space-y-2 pr-5">
                <li><strong>المهلة:</strong> يتم تقديم طلب الاستبدال خلال 48 ساعة من تاريخ استلامك للطرد.</li>
                <li><strong>حالة القطعة:</strong> أن تكون القطعة بحالتها المستلمة الأصلية، غير ملبوسة خارجياً، وبكامل بطاقاتها.</li>
                <li><strong>التكلفة:</strong> يتحمل العميل فقط مصاريف شحن المقاس البديل الرمزية، وتتولى Finalflash تجهيز المقاس المطلوب فوراً.</li>
              </ul>
            </div>
          )}

          {tab === 'authenticity' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#322339]">💎 معايير النظافة، الفحص اليدوي، والأصالة</h3>
              <p>
                قطع الثريفت والستريت وير لدينا تخضع لبروتوكول فحص صارم قبل أن تُعرض في المتجر:
              </p>
              <div className="space-y-2 rounded border border-[#e2dbe6] bg-[#f9f7fa] p-4">
                <p><strong>10/10 وكالة (Brand New Deadstock):</strong> قطعة لم تُرتد مسبقاً، بحالة المصنع التامة.</p>
                <p><strong>9.5/10 شبه جديد (Near Mint):</strong> قطعة مستعملة بعناية فائقة جداً، خالية من أي علامات استخدام واضحة.</p>
                <p><strong>9/10 ممتازة (Authentic Vintage):</strong> قطعة فينتاج أصلية كلاسيكية بدون أي ثقوب أو تمزقات.</p>
              </div>
              <p>
                كل قطعة تُغسل وتُعقم وتُكوى وتُفحص سحاباتها وتطريزاتها وخيوطها بدقة لضمان أنك تستلم قطعة تفخر بارتدائها.
              </p>
            </div>
          )}

          {tab === 'privacy' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#322339]">🔒 سياسة الخصوصية وحماية البيانات</h3>
              <p>
                نحن نحترم خصوصيتك لأقصى درجة:
              </p>
              <ul className="list-disc space-y-2 pr-5">
                <li>البيانات التي نطلبها (الاسم الكامل، رقم الهاتف، والولاية/البلدية) تُستخدم حصرياً لمعالجة وشحن وتأكيد طلبك.</li>
                <li>لا نقوم مطلقاً ببيع، تأجير، أو مشاركة بيانات عملائنا مع أي جهة خارجية أو إعلانية.</li>
                <li>المفضلة والسلة تُحفظ محلياً داخل متصفحك الشخصي عبر تقنية LocalStorage.</li>
                <li>في قسم آراء الزبائن، نحرص دائماً على إخفاء أي بيانات حساسة أو أرقام هواتف احتراما للخصوصية.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

function SizeGuide({
  tab,
  setTab,
  onClose
}: {
  tab: string;
  setTab: (tab: string) => void;
  onClose: () => void;
}) {
  const guides: Record<string, { title: string; tip: string; headers: string[]; rows: string[][] }> = {
    jogger: {
      title: 'Baggy Jogger Sizing Guide',
      tip: 'قصة الجوغر فضفاضة (Baggy Streetwear Fit) مع خصر مطاطي سميك ورباط قابل للتعديل.',
      headers: ['Size', 'الطول المناسب', 'الوزن التقريبي', 'طول البنطال', 'الخصر'],
      rows: [
        ['M', '160–173 cm', '52–68 kg', '98 cm', '72–86 cm'],
        ['L', '172–182 cm', '68–83 kg', '102 cm', '78–92 cm'],
        ['XL', '180–195 cm', '83–100 kg', '106 cm', '84–98 cm']
      ]
    },
    tshirts: {
      title: 'T-Shirts Sizing Guide',
      tip: 'قصات مريحة بطابع الستريت وير الأصيل مع ياقة دائرية متماسكة.',
      headers: ['Size', 'الطول المناسب', 'الوزن التقريبي', 'الطول الكامل', 'عرض الصدر'],
      rows: [
        ['S (Gymshark)', '155–170 cm', '48–65 kg', '69 cm', '50 cm'],
        ['M (Hard Rock)', '168–178 cm', '62–76 kg', '72 cm', '54 cm'],
        ['L', '176–185 cm', '75–88 kg', '75 cm', '58 cm'],
        ['XL', '182–195 cm', '88–105 kg', '78 cm', '62 cm']
      ]
    },
    shoes: {
      title: 'Converse & Shoes Sizing',
      tip: 'حذاء Converse Chuck Taylor All Star يعتمد القياس الأوروبي القياسي EU.',
      headers: ['EU Size', 'طول النعل الداخلي', 'US Men', 'US Women'],
      rows: [
        ['38', '24.0 cm', '5.5', '7.5'],
        ['39', '24.5 cm', '6.0', '8.0'],
        ['40', '25.5 cm', '7.0', '9.0'],
        ['41', '26.0 cm', '7.5', '9.5'],
        ['42', '26.5 cm', '8.5', '10.5']
      ]
    }
  };

  const guide = guides[tab] || guides['jogger'];

  return (
    <ModalShell onClose={onClose} labelledBy="size-guide-title">
      <div className="p-5 pt-16 sm:p-8 sm:pt-16">
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#7c3fb4]">Find your perfect fit</p>
        <h2 id="size-guide-title" className="display-font mt-2 text-3xl font-bold tracking-[-.06em] text-[#2d2234] sm:text-4xl">
          دليل المقاسات بالسنتيمتر
        </h2>

        <div className="mt-6 flex border-b border-[#ded5e1]">
          {Object.entries({ jogger: 'Jogger & Pants', tshirts: 'T-shirts', shoes: 'Shoes' }).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
                tab === key ? 'border-[#7c3fb4] text-[#7c3fb4]' : 'border-transparent text-[#847989] hover:text-[#2d2234]'
              }`}
              data-testid={`button-guide-tab-${key}`}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="arabic mt-5 text-xs text-[#6e6475]">{guide.tip}</p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#d9d0dd]">
                {guide.headers.map(header => (
                  <th key={header} className="px-3 py-3 text-[10px] uppercase tracking-[.08em] text-[#817687]">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {guide.rows.map(row => (
                <tr key={row[0]} className="border-b border-[#e9e2eb]">
                  {row.map((cell, i) => (
                    <td key={cell} className={`px-3 py-3.5 ${i === 0 ? 'font-bold text-[#7c3fb4]' : 'text-[#62586a]'}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="arabic mt-6 text-[11px] leading-6 text-[#897f8e]">
          هل تتردد بين مقاسين؟ ننصح عادة باختيار المقاس الأكبر للحصول على القصة الفضفاضة المريحة لستايل الستريت وير، أو راسلنا مباشرة عبر واتساب للمساعدة الفورية في اختيار المقاس المناسب لطولك ووزنك.
        </p>
      </div>
    </ModalShell>
  );
}

function OrderHistoryModal({
  orders,
  onClose
}: {
  orders: OrderRecord[];
  onClose: () => void;
}) {
  return (
    <ModalShell onClose={onClose} labelledBy="history-title">
      <div className="p-5 pt-16 sm:p-8 sm:pt-16">
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#7c3fb4]">Your Orders</p>
        <h2 id="history-title" className="display-font mt-2 text-3xl font-bold tracking-[-.06em] text-[#2d2234] sm:text-4xl">
          سجل طلباتي السابقة
        </h2>
        <p className="arabic mt-2 text-xs text-[#716677]">
          هنا تجد الطلبات المسجلة من جهازك مع أرقامها المرجعية لمتابعة التوصيل مع فريقنا.
        </p>

        {orders.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-[#796e80]">لا توجد طلبات سابقة مسجلة على هذا المتصفح.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {orders.map(ord => (
              <div key={ord.orderNumber} className="border border-[#ded6e2] bg-[#fbf9fc] p-4 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e7e0eb] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="mono-font font-bold text-[#7c3fb4]">{ord.orderNumber}</span>
                    <span className="text-[10px] text-[#867b8c]">({ord.date})</span>
                  </div>
                  <span className="mono-font font-bold text-[#2d2234]">{formatPrice(ord.total)}</span>
                </div>

                <div className="mt-3 space-y-1 text-[11px] text-[#63576a]">
                  {ord.items.map((it, idx) => (
                    <p key={idx}>• {it.productTitle} x{it.quantity} ({formatPrice(it.unitPrice)})</p>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between text-[10px] text-[#7d7184]">
                  <span>{ord.wilaya} · {ord.commune} ({ord.deliveryMethod})</span>
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`سلام Finalflash، أود الاستفسار عن حالة طلبي ${ord.orderNumber}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 font-bold text-[#7c3fb4] hover:underline"
                  >
                    استفسار عبر واتساب <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function Lightbox({
  index,
  onClose,
  onMove
}: {
  index: number;
  onClose: () => void;
  onMove: (delta: number) => void;
}) {
  const item = feedbacks[index];
  useModalA11y(true, onClose);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#17101d]/92 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Customer feedback image"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-w-[540px]">
        <ProductImage
          src={item.image}
          alt={item.title}
          className="max-h-[76dvh] max-w-full rounded-sm object-contain"
          fallbackLabel="CUSTOMER FEEDBACK"
        />
        <div className="mt-4 flex items-center justify-between text-white">
          <div>
            <p className="text-sm font-bold">{item.title}</p>
            <p className="mt-1 text-xs text-[#c7b3cf]">
              {item.tag} · {index + 1} / {feedbacks.length}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onMove(-1)}
              className="flex h-9 w-9 items-center justify-center border border-white/30 hover:bg-white hover:text-[#241a30]"
              aria-label="Previous feedback"
              data-testid="button-previous-feedback"
            >
              <ChevronLeft size={17} />
            </button>
            <button
              onClick={() => onMove(1)}
              className="flex h-9 w-9 items-center justify-center border border-white/30 hover:bg-white hover:text-[#241a30]"
              aria-label="Next feedback"
              data-testid="button-next-feedback"
            >
              <ChevronRight size={17} />
            </button>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center border border-white/30 hover:bg-white hover:text-[#241a30]"
              aria-label="Close feedback"
              data-testid="button-close-feedback"
            >
              <X size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RootApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}