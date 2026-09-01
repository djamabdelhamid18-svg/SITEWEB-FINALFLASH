import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleHelp, Eye, Heart, Instagram, Minus, PackageCheck, Plus,
  Ruler, Search, ShieldCheck, ShoppingBag, SlidersHorizontal,
  Star, Truck, X, Zap
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

const queryClient = new QueryClient();
const currency = 'DA';
const imageBase = '/images/';

type Color = { name: string; hex: string; image?: string };
type Product = {
  id: number; title: string; category: string; price: number; badge: string;
  rating: number; inStock: boolean; stockCount: number; quality: string;
  images: string[]; description: string; features: string[]; sizes: string[]; colors: Color[];
};
type CartItem = { product: Product; size: string; color: Color | null; quantity: number };

const products: Product[] = [
  {
    id: 1, title: 'Baggy Jogger', category: 'pants', price: 2900, badge: 'MOST WANTED',
    rating: 5, inStock: true, stockCount: 6, quality: '10/10 condition',
    images: ['jogger-black.jpg', 'jogger-grey.jpg'],
    description: 'بنطال جوغر بقصة باغية فضفاضة ومريحة. قماش قطني سميك، وتطريز Flaming Dice من تنفيذ Finalflash.',
    features: ['Baggy streetwear fit', 'تطريز Flaming Dice دقيق', 'خصر مطاطي ورباط قابل للتعديل', 'متوفر بالأسود والرمادي'],
    sizes: ['M', 'L', 'XL'], colors: [{ name: 'Black', hex: '#17151a', image: 'jogger-black.jpg' }, { name: 'Grey', hex: '#8b8990', image: 'jogger-grey.jpg' }]
  },
  {
    id: 2, title: 'Thrifted Gymshark T-Shirt', category: 'tshirts', price: 2000, badge: 'THRIFT 10/10',
    rating: 5, inStock: true, stockCount: 2, quality: '10/10 وكالة',
    images: ['gymshark-front.jpg', 'gymshark-back.jpg'],
    description: 'تيشيرت Gymshark أصلي 100% بحالة الوكالة. شعار أمامي مطرز وطباعة فضية جريئة في الخلف.',
    features: ['قطعة أصلية بحالة استثنائية', 'شعار أمامي وطباعة خلفية', 'خامة قطنية ناعمة', 'المقاس المتوفر: S'],
    sizes: ['S'], colors: [{ name: 'Black', hex: '#17151a', image: 'gymshark-front.jpg' }]
  },
  {
    id: 3, title: 'Thrifted Hard Rock Graphic Tee', category: 'tshirts', price: 1500, badge: '1 OF 1',
    rating: 5, inStock: true, stockCount: 1, quality: '9/10 ممتازة',
    images: ['hardrock-front.jpg', 'hardrock-back.jpg'],
    description: 'تيشيرت Hard Rock Cafe vintage نادر باللون الأزرق. جرافيك قيثارة وتنانين بطابع أصيل.',
    features: ['قطعة ثريفت نادرة وفريدة', 'شعار Hard Rock Cafe أصلي', 'جرافيك خلفي vintage', 'المقاس: M'],
    sizes: ['M'], colors: [{ name: 'Blue', hex: '#243b66', image: 'hardrock-front.jpg' }]
  },
  {
    id: 4, title: 'Authentic All Star Converse', category: 'shoes', price: 2900, badge: 'AUTHENTIC',
    rating: 5, inStock: true, stockCount: 1, quality: '9.5/10 شبه جديد',
    images: ['Converse-1.jpg', 'Converse-2.jpg', 'Converse-3.jpg', 'Converse-4.jpg'],
    description: 'Converse Chuck Taylor All Star أصلي باللون الأبيض. نظافة شبه جديدة وجاهز للارتداء.',
    features: ['أصلي 100%', 'حالة النعل والجزء العلوي ممتازة', 'White Classic', 'المقاس: 39 EU'],
    sizes: ['39'], colors: [{ name: 'White Classic', hex: '#e9e4da', image: 'Converse-1.jpg' }]
  },
  {
    id: 5, title: 'Carhartt Baggy Pants', category: 'pants', price: 3000, badge: 'WORKWEAR',
    rating: 5, inStock: true, stockCount: 1, quality: '9.5/10 متانة أصلية',
    images: ['CarharttBaggyPants1.jpg', 'CarharttBaggyPants2.jpg', 'CarharttBaggyPants3.jpg'],
    description: 'بنطال Carhartt أصلي بقصة فضفاضة. كانفاس سميك ومقاوم لعشاق الستريت وير والتزلج.',
    features: ['خامة Carhartt أصلية شديدة التحمل', 'قصة Baggy كلاسيكية', 'حالة ممتازة 9.5/10', 'المقاس الموصى به: L'],
    sizes: ['L'], colors: [{ name: 'Black', hex: '#17151a', image: 'CarharttBaggyPants1.jpg' }]
  },
  {
    id: 6, title: 'The Finalflash Set', category: 'bundle', price: 3950, badge: 'SET PRICE',
    rating: 5, inStock: true, stockCount: 4, quality: 'Save 950 DA',
    images: ['jogger-grey.jpg', 'gymshark-front.jpg'],
    description: 'Baggy Jogger مع تيشيرت Gymshark أو Hard Rock. اختر القطع التي تشبهك بسعر الطقم.',
    features: ['Jogger أسود أو رمادي', 'Gymshark أو Hard Rock tee', '3950 DA بدل 4900 DA', 'التوصيل والدفع عند الاستلام'],
    sizes: ['M', 'L', 'XL'], colors: [{ name: 'Grey set', hex: '#8b8990', image: 'jogger-grey.jpg' }, { name: 'Black set', hex: '#17151a', image: 'jogger-black.jpg' }]
  }
];

const categories = [
  { id: 'all', label: 'All pieces' }, { id: 'pants', label: 'Pants & Joggers' },
  { id: 'tshirts', label: 'T-Shirts' }, { id: 'shoes', label: 'Shoes' }, { id: 'bundle', label: 'Special set' }
];

const wilayas = [
  '01 - أدرار (Adrar)', '02 - الشلف (Chlef)', '03 - الأغواط (Laghouat)', '04 - أم البواقي (Oum El Bouaghi)', '05 - باتنة (Batna)', '06 - بجاية (Béjaïa)', '07 - بسكرة (Biskra)', '08 - بشار (Béchar)', '09 - البليدة (Blida)', '10 - البويرة (Bouira)', '11 - تمنراست (Tamanrasset)', '12 - تبسة (Tébessa)', '13 - تلمسان (Tlemcen)', '14 - تيارت (Tiaret)', '15 - تيزي وزو (Tizi Ouzou)', '16 - الجزائر العاصمة (Alger)', '17 - الجلفة (Djelfa)', '18 - جيجل (Jijel)', '19 - سطيف (Sétif)', '20 - سعيدة (Saïda)', '21 - سكيكدة (Skikda)', '22 - سيدي بلعباس (Sidi Bel Abbès)', '23 - عنابة (Annaba)', '24 - قالمة (Guelma)', '25 - قسنطينة (Constantine)', '26 - المدية (Médéa)', '27 - مستغانم (Mostaganem)', '28 - المسيلة (M’Sila)', '29 - معسكر (Mascara)', '30 - ورقلة (Ouargla)', '31 - وهران (Oran)', '32 - البيض (El Bayadh)', '33 - إليزي (Illizi)', '34 - برج بوعريريج (Bordj Bou Arreridj)', '35 - بومرداس (Boumerdès)', '36 - الطارف (El Tarf)', '37 - تندوف (Tindouf)', '38 - تيسمسيلت (Tissemsilt)', '39 - الوادي (El Oued)', '40 - خنشلة (Khenchela)', '41 - سوق أهراس (Souk Ahras)', '42 - تيبازة (Tipaza)', '43 - ميلة (Mila)', '44 - عين الدفلى (Aïn Defla)', '45 - النعامة (Naâma)', '46 - عين تموشنت (Aïn Témouchent)', '47 - غرداية (Ghardaïa)', '48 - غليزان (Relizane)', '49 - تيميمون (Timimoun)', '50 - برج باجي مختار (Bordj Badji Mokhtar)', '51 - أولاد جلال (Ouled Djellal)', '52 - بني عباس (Béni Abbès)', '53 - عين صالح (In Salah)', '54 - عين قزام (In Guezzam)', '55 - تقرت (Touggourt)', '56 - جانت (Djanet)', '57 - المغير (El M’Ghair)', '58 - المنيعة (El Meniaa)'
];

const feedbacks = [
  { image: 'feedback-1.jpg', title: 'محادثة زبون مؤكد', tag: 'سرعة التوصيل' },
  { image: 'feedback-2.jpg', title: 'استلام الطرد', tag: 'جودة 10/10' },
  { image: 'feedback-3.jpg', title: 'تأكيد المقاسات', tag: 'مطابقة تامة' },
  { image: 'feedback-4.jpg', title: 'رضا الزبون', tag: 'الدفع عند الاستلام' },
  { image: 'feedback-5.jpg', title: 'خامة ممتازة', tag: 'قماش سميك' },
  { image: 'feedback-6.jpg', title: 'ثقة متجددة', tag: 'زبون دائم' },
  { image: 'feedback-7.jpg', title: 'قطعة مميزة', tag: 'اختيار موفق' },
  { image: 'feedback-8.jpg', title: 'تجربة جميلة', tag: 'شكراً لثقتكم' }
];

function ProductImage({ src, alt, className = '', fallbackLabel = 'FINALFLASH' }: { src: string; alt: string; className?: string; fallbackLabel?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className={`image-fallback flex items-center justify-center ${className}`} aria-label={alt}><span className="fallback-mark border px-3 py-2 text-center text-[11px]">{fallbackLabel}</span></div>;
  return <img src={`${imageBase}${src}`} alt={alt} className={className} onError={() => setFailed(true)} />;
}

function formatPrice(price: number) { return `${price.toLocaleString('fr-FR')} ${currency}`; }

function App() {
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');
  const [stockOnly, setStockOnly] = useState(false);
  const [favorites, setFavorites] = useState<number[]>(() => JSON.parse(localStorage.getItem('finalflash_wishlist') || '[]'));
  const [cart, setCart] = useState<CartItem[]>(() => JSON.parse(localStorage.getItem('finalflash_cart') || '[]'));
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideTab, setGuideTab] = useState('jogger');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => localStorage.setItem('finalflash_wishlist', JSON.stringify(favorites)), [favorites]);
  useEffect(() => localStorage.setItem('finalflash_cart', JSON.stringify(cart)), [cart]);
  useEffect(() => { if (!notice) return; const t = window.setTimeout(() => setNotice(''), 2600); return () => window.clearTimeout(t); }, [notice]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const list = products.filter(p => (category === 'all' || p.category === category) && (!stockOnly || p.inStock) && (!q || `${p.title} ${p.description} ${p.category}`.toLowerCase().includes(q)));
    return [...list].sort((a, b) => sort === 'price-low' ? a.price - b.price : sort === 'price-high' ? b.price - a.price : a.id - b.id);
  }, [category, query, sort, stockOnly]);

  const itemCount = cart.reduce((n, item) => n + item.quantity, 0);
  const subtotal = cart.reduce((n, item) => n + item.product.price * item.quantity, 0);

  function openProduct(product: Product) {
    setQuickView(product); setSelectedSize(product.sizes[0] || ''); setSelectedColor(product.colors[0] || null);
  }
  function toggleFavorite(id: number) { setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); }
  function addToCart(product: Product, size = product.sizes[0] || '', color: Color | null = product.colors[0] || null) {
    setCart(prev => {
      const index = prev.findIndex(x => x.product.id === product.id && x.size === size && x.color?.name === color?.name);
      if (index >= 0) return prev.map((item, i) => i === index ? { ...item, quantity: Math.min(item.quantity + 1, product.stockCount) } : item);
      return [...prev, { product, size, color, quantity: 1 }];
    });
    setNotice(`${product.title} added to bag`);
  }
  function updateQuantity(index: number, delta: number) { setCart(prev => prev.map((item, i) => i === index ? { ...item, quantity: Math.max(1, Math.min(item.product.stockCount, item.quantity + delta)) } : item)); }
  function removeCartItem(index: number) { setCart(prev => prev.filter((_, i) => i !== index)); }
  function resetFilters() { setCategory('all'); setQuery(''); setSort('featured'); setStockOnly(false); }

  return (
    <div dir="rtl" className="noise min-h-[100dvh] bg-[#f7f5f8]">
      <header className="border-b border-[#e4e0e8] bg-[#f7f5f8]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex h-[74px] max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <a href="#top" dir="ltr" className="group flex items-center gap-3" data-testid="link-brand">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#22182e] ring-1 ring-[#d8c3e5]"><img src="/images/logo.jpg" alt="" className="h-full w-full object-cover" /></div>
            <div><div className="display-font text-[18px] font-bold tracking-[-.04em]">FINALFLASH</div><div className="hidden text-[9px] uppercase tracking-[.22em] text-[#847d8d] sm:block">Curated in Algeria</div></div>
          </a>
          <nav dir="ltr" className="hidden items-center gap-8 text-[12px] font-semibold uppercase tracking-[.12em] text-[#625a6c] md:flex" aria-label="Main navigation">
            <a href="#collection" className="hover:text-[#7c3fb4]" data-testid="link-collection">Collection</a>
            <a href="#story" className="hover:text-[#7c3fb4]" data-testid="link-story">The edit</a>
            <a href="#faq" className="hover:text-[#7c3fb4]" data-testid="link-faq">Info</a>
          </nav>
          <div className="flex items-center gap-2">
             <label dir="ltr" className="hidden items-center gap-2 border-b border-[#bdb7c3] px-2 py-1.5 focus-within:border-[#7c3fb4] lg:flex"><Search size={15} className="text-[#7c3fb4]" /><span className="sr-only">Search pieces</span><input dir="auto" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search the edit" className="w-32 bg-transparent text-xs outline-none placeholder:text-[#9c95a4]" data-testid="input-search-desktop" /></label>
            <button onClick={() => setCartOpen(true)} className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#ebe5f0]" aria-label="Open shopping bag" data-testid="button-open-cart"><ShoppingBag size={19} strokeWidth={1.8} />{itemCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#7c3fb4] px-1 text-[9px] font-bold text-white">{itemCount}</span>}</button>
          </div>
        </div>
        <div className="border-t border-[#e4e0e8] px-5 py-2.5 lg:hidden">
           <label dir="ltr" className="mx-auto flex max-w-[520px] items-center gap-2 border-b border-[#bdb7c3] px-1 py-1.5 focus-within:border-[#7c3fb4]">
            <Search size={15} className="text-[#7c3fb4]" />
            <span className="sr-only">Search pieces</span>
             <input dir="auto" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search the edit / ابحث عن قطعة" className="w-full bg-transparent text-xs outline-none placeholder:text-[#9c95a4]" data-testid="input-search-mobile" />
          </label>
        </div>
      </header>
      <div className="border-b border-[#33283d] bg-[#241a30] px-5 py-2.5 text-center text-[10px] font-medium tracking-[.04em] text-[#e1d6e8] sm:text-xs">توصيل متوفر إلى 58 ولاية — المعاينة قبل الدفع والدفع عند الاستلام</div>

      <main id="top">
        <section className="mx-auto grid max-w-[1400px] gap-7 px-5 pb-20 pt-12 sm:px-8 sm:pt-16 lg:grid-cols-[1.07fr_.93fr] lg:gap-16 lg:px-12 lg:pb-28 lg:pt-24">
          <div className="flex flex-col justify-center reveal">
            <p className="mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-[#7c3fb4]"><span className="h-px w-8 bg-[#b58cd9]" /> Hand-picked streetwear / الجزائر</p>
             <h1 dir="ltr" className="display-font max-w-[720px] text-[clamp(3rem,8vw,7.2rem)] font-bold leading-[.86] tracking-[-.075em] text-[#241c2c]">RARE<br /><span className="text-[#7c3fb4]">BY CHOICE.</span></h1>
            <p className="arabic mt-8 max-w-[540px] text-[13px] leading-8 text-[#665d6c] sm:text-[15px]">قطع ستريت وير وثريفت منتقاة بعين شخص حقيقي. حالة صادقة، كميات قليلة، وطلب سهل عبر واتساب في كل الجزائر.</p>
             <div dir="ltr" className="mt-9 flex flex-wrap items-center gap-3"><a href="#collection" className="group flex items-center gap-3 bg-[#241c2c] px-5 py-3.5 text-xs font-bold text-white transition-colors hover:bg-[#7c3fb4]" data-testid="link-shop-collection">Shop the collection <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></a><a href="#story" className="px-4 py-3.5 text-xs font-bold text-[#5f5667] underline decoration-[#c8bed0] underline-offset-4 hover:text-[#7c3fb4]" data-testid="link-our-standard">Our standard</a></div>
             <div dir="ltr" className="mt-14 grid max-w-[500px] grid-cols-3 border-y border-[#ded8e2] py-4 text-[10px] uppercase tracking-[.12em] text-[#817988]"><div><strong className="display-font block text-lg tracking-normal text-[#2c2233]">05</strong> hand-picked edits</div><div><strong className="display-font block text-lg tracking-normal text-[#2c2233]">58</strong> wilayas</div><div><strong className="display-font block text-lg tracking-normal text-[#2c2233]">01:01</strong> one of one</div></div>
          </div>
          <div className="relative min-h-[460px] overflow-hidden bg-[#2a2033] reveal [animation-delay:.1s] sm:min-h-[600px]">
            <ProductImage src="jogger-black.jpg" alt="Baggy Jogger in black" className="h-full w-full object-cover mix-blend-normal" fallbackLabel="BAGGY / 01" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#17121c]/80 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white sm:bottom-8 sm:left-8 sm:right-8"><div><p className="mb-1 text-[10px] uppercase tracking-[.18em] text-[#d3b5ef]">Featured piece</p><h2 className="display-font text-2xl font-bold tracking-[-.04em]">Baggy Jogger</h2><p className="mt-1 text-xs text-[#ddd2e4]">Black / M · L · XL</p></div><button onClick={() => openProduct(products[0])} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/10 backdrop-blur-sm hover:bg-[#7c3fb4]" aria-label="View Baggy Jogger" data-testid="button-view-featured"><ArrowUpRight size={19} /></button></div>
            <div className="absolute right-5 top-5 border border-white/25 bg-[#241a30]/75 px-3 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#f0e5f5] backdrop-blur-sm">Most wanted</div>
          </div>
        </section>

        <section id="collection" className="border-y border-[#e3dde7] bg-[#fbfafb] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#7c3fb4]">The current edit / 2026</p><h2 className="display-font text-4xl font-bold tracking-[-.06em] text-[#281f30] sm:text-6xl">Pieces with a past.<br /><span className="text-[#7c3fb4]">A place in yours.</span></h2></div><p className="max-w-[290px] text-sm leading-6 text-[#756c7b]">No endless catalogue. Just a small selection we would wear ourselves.</p></div>
            <div className="mb-8 flex flex-col gap-4 border-y border-[#e3dde7] py-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="hide-scrollbar flex gap-1 overflow-x-auto" role="tablist" aria-label="Product categories">{categories.map(c => <button key={c.id} onClick={() => setCategory(c.id)} className={`whitespace-nowrap px-3 py-2 text-xs font-bold transition-colors ${category === c.id ? 'bg-[#241c2c] text-white' : 'text-[#766d7d] hover:text-[#7c3fb4]'}`} role="tab" aria-selected={category === c.id} data-testid={`button-category-${c.id}`}>{c.label}</button>)}</div>
              <div className="flex flex-wrap items-center gap-3"><label className="flex items-center gap-2 text-xs text-[#655b6c]"><input type="checkbox" checked={stockOnly} onChange={e => setStockOnly(e.target.checked)} className="accent-[#7c3fb4]" data-testid="input-stock-only" /> In stock only</label><div className="relative"><SlidersHorizontal size={13} className="pointer-events-none absolute left-2.5 top-2.5 text-[#7c3fb4]" /><select value={sort} onChange={e => setSort(e.target.value)} className="appearance-none border border-[#ddd6e1] bg-white py-2 pl-8 pr-8 text-xs text-[#514856] outline-none focus:border-[#7c3fb4]" aria-label="Sort products" data-testid="select-sort"><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select><ChevronDown size={13} className="pointer-events-none absolute right-2 top-2.5 text-[#847b8d]" /></div></div>
            </div>
            <div className="mb-5 flex items-center justify-between text-[10px] uppercase tracking-[.14em] text-[#8e8695]"><span>{filtered.length} of {products.length} pieces</span>{(query || category !== 'all' || stockOnly) && <button onClick={resetFilters} className="text-[#7c3fb4] underline underline-offset-2" data-testid="button-reset-filters">Clear filters</button>}</div>
            {filtered.length ? <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-7">{filtered.map((product, i) => <ProductCard key={product.id} product={product} favorite={favorites.includes(product.id)} onFavorite={() => toggleFavorite(product.id)} onOpen={() => openProduct(product)} onAdd={() => addToCart(product)} delay={i * 45} />)}</div> : <div className="border border-dashed border-[#cfc6d5] px-6 py-20 text-center"><Search className="mx-auto mb-4 text-[#9c91a5]" size={24} /><h3 className="display-font text-xl font-bold">Nothing in this edit.</h3><p className="mt-2 text-sm text-[#756c7b]">Try another word or open the full collection.</p><button onClick={resetFilters} className="mt-5 bg-[#241c2c] px-4 py-2.5 text-xs font-bold text-white" data-testid="button-empty-reset">Reset view</button></div>}
          </div>
        </section>

        <section id="story" className="mx-auto grid max-w-[1400px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[.82fr_1.18fr] lg:gap-24 lg:px-12 lg:py-28">
          <div><p className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#7c3fb4]">The Finalflash standard</p><h2 className="display-font text-4xl font-bold leading-[.95] tracking-[-.06em] text-[#281f30] sm:text-6xl">A good piece<br />should have<br /><span className="text-[#7c3fb4]">a story.</span></h2><p className="arabic mt-8 max-w-[440px] text-sm leading-8 text-[#6e6575]">نختار كل قطعة يدوياً، نفحصها ونكتب حالتها كما هي. لا صور مخادعة ولا كميات وهمية. فقط ملابس تستحق مكاناً جديداً.</p><a href="#trust" className="mt-7 inline-flex items-center gap-2 text-xs font-bold text-[#2c2233] underline decoration-[#b58cd9] underline-offset-4" data-testid="link-trust-details">How we keep it honest <ArrowRight size={14} /></a></div>
          <div id="trust" className="grid border-t border-[#ded7e2] sm:grid-cols-2">{[
            { icon: Eye, title: 'See before you pay', text: 'افتح الطرد وافحص القطعة والمقاس قبل دفع أي دينار.' },
            { icon: ShieldCheck, title: 'Condition, clearly stated', text: 'كل قطعة ثريفت تحصل على تقييم حالة واضح وصور حقيقية.' },
            { icon: Truck, title: '58 wilayas, no guesswork', text: 'توصيل للمنزل أو المكتب، شمالاً وجنوباً، مع الدفع عند الاستلام.' },
            { icon: PackageCheck, title: '48-hour size exchange', text: 'المقاس لم يناسبك؟ نرتب الاستبدال خلال 48 ساعة.' }
          ].map(({ icon: Icon, title, text }, i) => <div key={title} className={`border-b border-[#ded7e2] p-6 ${i % 2 === 0 ? 'sm:border-r' : ''}`}><Icon size={20} strokeWidth={1.5} className="mb-7 text-[#7c3fb4]" /><h3 className="display-font text-lg font-bold text-[#2e2435]">{title}</h3><p className="arabic mt-3 text-xs leading-6 text-[#766d7d]">{text}</p></div>)}</div>
        </section>

        <section className="bg-[#251b31] px-5 py-16 text-white sm:px-8 lg:px-12 lg:py-20"><div className="mx-auto grid max-w-[1400px] items-center gap-10 lg:grid-cols-[1fr_auto]"><div><p className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#d5b5f0]"><Zap size={13} /> Set price</p><h2 className="display-font max-w-[720px] text-4xl font-bold leading-[.9] tracking-[-.06em] sm:text-6xl">Jogger + tee.<br /><span className="text-[#d3a6f4]">3950 DA.</span></h2><p className="arabic mt-6 max-w-[570px] text-sm leading-7 text-[#c7bbce]">اختر الجوغر والتيشيرت المفضل لديك. وفّر 950 دج على الطقم الكامل، والتوصيل علينا أن نسهّلها.</p></div><div className="border border-[#6e547a] p-6 sm:min-w-[280px]"><div className="flex items-baseline justify-between border-b border-[#51405b] pb-4"><span className="display-font text-3xl font-bold">3,950</span><span className="mono-font text-xs text-[#b9a7c3]">DA / SET</span></div><div className="mt-5 flex items-center justify-between text-xs text-[#b9a7c3]"><span>Regular 4,900 DA</span><span className="text-[#e1c7f3]">Save 950</span></div><button onClick={() => { openProduct(products[5]); }} className="mt-7 flex w-full items-center justify-center gap-2 bg-[#d3a6f4] py-3.5 text-xs font-bold text-[#271b32] hover:bg-white" data-testid="button-customize-set">Customize the set <ArrowRight size={15} /></button></div></div></section>

        <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28"><div className="mb-9 flex items-end justify-between"><div><p className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#7c3fb4]">Seen in the wild</p><h2 className="display-font text-4xl font-bold tracking-[-.06em] text-[#281f30] sm:text-5xl">From the people<br /><span className="text-[#7c3fb4]">who got the piece.</span></h2></div><span className="hidden text-xs text-[#857b8d] sm:block">@finalflash.8</span></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{feedbacks.map((item, index) => <button key={item.image} onClick={() => setLightbox(index)} className="group relative aspect-[.78] overflow-hidden bg-[#2a2033] text-left" data-testid={`button-feedback-${index}`}><ProductImage src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" fallbackLabel="REAL PEOPLE / REAL PIECES" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1e1526] to-transparent p-3 pt-12 text-white"><p className="text-[10px] font-bold">{item.title}</p><p className="mt-1 text-[9px] text-[#dac3e8]">{item.tag}</p></div></button>)}</div></section>

        <section id="faq" className="border-t border-[#e3dde7] bg-[#fbfafb] px-5 py-20 sm:px-8 lg:px-12 lg:py-24"><div className="mx-auto grid max-w-[1100px] gap-12 lg:grid-cols-[.75fr_1.25fr]"><div><p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#7c3fb4]"><CircleHelp size={14} /> Need to know</p><h2 className="display-font text-4xl font-bold leading-[.94] tracking-[-.06em] text-[#281f30] sm:text-5xl">Good questions<br /><span className="text-[#7c3fb4]">deserve answers.</span></h2><button onClick={() => { setGuideTab('jogger'); setGuideOpen(true); }} className="mt-8 flex items-center gap-2 border-b border-[#bba5ca] pb-2 text-xs font-bold text-[#504558]" data-testid="button-open-size-guide"><Ruler size={15} className="text-[#7c3fb4]" /> Open the size guide</button></div><div>{[
          ['How do I place an order?', 'Add the pieces you want to your bag, choose delivery details, then send the order through WhatsApp. We confirm everything with you personally.'],
          ['Where do you deliver?', 'We deliver to all 58 wilayas in Algeria, home or desk delivery. North usually takes 24–48 hours; the south takes 2–4 days.'],
          ['Are thrift pieces authentic and clean?', 'Yes. Every thrift piece is hand-picked, checked, washed and described with an honest condition note before it reaches the edit.'],
          ['Can I check before paying?', 'Of course. You can open the parcel and check the condition and size before paying the delivery agent.']
        ].map(([q, a], i) => <div key={q} className="border-t border-[#ded7e2]"><button onClick={() => setFaqOpen(faqOpen === i ? null : i)} className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-bold text-[#382d40]" aria-expanded={faqOpen === i} data-testid={`button-faq-${i}`}><span>{q}</span><Plus size={17} className={`shrink-0 text-[#7c3fb4] transition-transform ${faqOpen === i ? 'rotate-45' : ''}`} /></button>{faqOpen === i && <p className="arabic max-w-[640px] pb-5 text-xs leading-7 text-[#746a7c]">{a}</p>}</div>)}</div></div></section>
      </main>

      <footer className="bg-[#241a30] px-5 py-10 text-[#c9bdcf] sm:px-8 lg:px-12"><div className="mx-auto flex max-w-[1400px] flex-col gap-10 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex items-center gap-3"><img src="/images/logo.jpg" alt="Finalflash" className="h-10 w-10 rounded-full object-cover ring-1 ring-[#d8c3e5]" /><div className="display-font text-xl font-bold tracking-[-.05em] text-white">FINALFLASH</div></div><p className="arabic mt-3 max-w-[370px] text-xs leading-6 text-[#a99aad]">قطع ستريت وير وثريفت منتقاة بعناية في الجزائر. القطعة المناسبة لا تحتاج ضجيجاً.</p></div><div className="flex flex-wrap gap-5 text-xs font-semibold"><a href="https://www.instagram.com/finalflash.8/" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white" data-testid="link-instagram"><Instagram size={15} /> @finalflash.8</a><a href="https://wa.me/213778659640" target="_blank" rel="noreferrer" className="hover:text-white" data-testid="link-whatsapp">WhatsApp orders</a></div></div><div className="mx-auto mt-10 max-w-[1400px] border-t border-[#493951] pt-4 text-[10px] uppercase tracking-[.13em] text-[#86778d]">Finalflash — independent streetwear & thrift / Algeria</div></footer>

      {notice && <div role="status" className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 border border-[#5e4470] bg-[#241a30] px-4 py-3 text-xs font-bold text-white shadow-xl">{notice}</div>}
      {quickView && <QuickView product={quickView} selectedSize={selectedSize} selectedColor={selectedColor} setSelectedSize={setSelectedSize} setSelectedColor={setSelectedColor} onClose={() => setQuickView(null)} onAdd={() => { addToCart(quickView, selectedSize, selectedColor); setQuickView(null); setCartOpen(true); }} onGuide={() => { setGuideTab(quickView.category === 'shoes' ? 'shoes' : quickView.category === 'tshirts' ? 'tshirts' : 'jogger'); setGuideOpen(true); }} />}
      {cartOpen && <CartDrawer cart={cart} itemCount={itemCount} subtotal={subtotal} onClose={() => setCartOpen(false)} onUpdate={updateQuantity} onRemove={removeCartItem} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />}
      {checkoutOpen && <CheckoutModal cart={cart} subtotal={subtotal} onClose={() => setCheckoutOpen(false)} onBack={() => { setCheckoutOpen(false); setCartOpen(true); }} />}
      {guideOpen && <SizeGuide tab={guideTab} setTab={setGuideTab} onClose={() => setGuideOpen(false)} />}
      {lightbox !== null && <Lightbox index={lightbox} onClose={() => setLightbox(null)} onMove={delta => setLightbox((lightbox + delta + feedbacks.length) % feedbacks.length)} />}
    </div>
  );
}

function ProductCard({ product, favorite, onFavorite, onOpen, onAdd, delay }: { product: Product; favorite: boolean; onFavorite: () => void; onOpen: () => void; onAdd: () => void; delay: number }) {
  return <article dir="ltr" className="group reveal" style={{ animationDelay: `${delay}ms` }} data-testid={`card-product-${product.id}`}><div className="product-art relative aspect-[.78] cursor-pointer overflow-hidden bg-[#2a2033]" onClick={onOpen}><ProductImage src={product.images[0]} alt={product.title} className="h-full w-full object-cover" fallbackLabel={product.category === 'bundle' ? 'THE SET' : 'FINALFLASH'} /><div className="absolute left-3 top-3 flex flex-col gap-1"><span className="w-max bg-[#241a30] px-2 py-1 text-[9px] font-bold tracking-[.12em] text-[#eadcf2]">{product.badge}</span>{product.stockCount <= 2 && <span className="w-max bg-[#b35d4f] px-2 py-1 text-[9px] font-bold text-white">Only {product.stockCount} left</span>}</div><button onClick={e => { e.stopPropagation(); onFavorite(); }} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#f7f5f8]/90 text-[#48394e] hover:text-[#7c3fb4]" aria-label={favorite ? `Remove ${product.title} from favorites` : `Add ${product.title} to favorites`} data-testid={`button-favorite-${product.id}`}><Heart size={15} fill={favorite ? 'currentColor' : 'none'} /></button><button onClick={e => { e.stopPropagation(); onOpen(); }} className="absolute bottom-3 left-3 right-3 hidden items-center justify-center gap-2 bg-[#f7f5f8]/95 py-3 text-[10px] font-bold text-[#2d2334] backdrop-blur-sm hover:bg-white sm:flex" data-testid={`button-quick-view-${product.id}`}><Eye size={14} /> Quick view</button></div><div className="pt-3"><div className="flex items-start justify-between gap-2"><div><button onClick={onOpen} dir="ltr" className="text-left display-font text-sm font-bold leading-tight text-[#302536] hover:text-[#7c3fb4]" data-testid={`button-title-${product.id}`}>{product.title}</button><p dir="auto" className="mt-1 text-[10px] text-[#897f8e]">{product.sizes.join(' / ')} · {product.quality}</p></div><button onClick={onAdd} className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#d4cadb] text-[#7c3fb4] hover:border-[#7c3fb4] hover:bg-[#7c3fb4] hover:text-white" aria-label={`Add ${product.title} to bag`} data-testid={`button-add-product-${product.id}`}><Plus size={15} /></button></div><p dir="ltr" className="mono-font mt-3 text-xs font-medium text-[#403345]">{formatPrice(product.price)}</p></div></article>;
}

function ModalShell({ children, onClose, labelledBy }: { children: ReactNode; onClose: () => void; labelledBy?: string }) {
  return <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[#1c1422]/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby={labelledBy} onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><div className="modal-enter relative max-h-[92dvh] w-full overflow-y-auto bg-[#fbfafb] shadow-2xl sm:max-w-[900px]">{children}<button onClick={onClose} className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#f0ebf2] text-[#48394e] hover:bg-[#241a30] hover:text-white" aria-label="Close dialog" data-testid="button-close-dialog"><X size={17} /></button></div></div>;
}

function QuickView({ product, selectedSize, selectedColor, setSelectedSize, setSelectedColor, onClose, onAdd, onGuide }: { product: Product; selectedSize: string; selectedColor: Color | null; setSelectedSize: (s: string) => void; setSelectedColor: (c: Color) => void; onClose: () => void; onAdd: () => void; onGuide: () => void }) {
  const [image, setImage] = useState(product.images[0]);
  return <ModalShell onClose={onClose} labelledBy="quick-view-title"><div className="grid gap-7 p-5 pt-16 sm:grid-cols-2 sm:p-8"><div><div className="product-art aspect-[.84] overflow-hidden bg-[#2a2033]"><ProductImage src={image} alt={product.title} className="h-full w-full object-cover" /></div><div className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto">{product.images.map(src => <button key={src} onClick={() => setImage(src)} className={`h-16 w-14 shrink-0 overflow-hidden border-2 ${image === src ? 'border-[#7c3fb4]' : 'border-transparent opacity-60'}`} data-testid={`button-gallery-${src}`}><ProductImage src={src} alt={`${product.title} view`} className="h-full w-full object-cover" /></button>)}</div></div><div className="flex flex-col pt-2"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#7c3fb4]">{product.badge}</p><h2 id="quick-view-title" className="display-font mt-2 text-3xl font-bold leading-none tracking-[-.05em] text-[#2d2234]">{product.title}</h2><div className="mt-4 flex items-center justify-between border-b border-[#e1d9e3] pb-4"><span className="mono-font text-lg text-[#7c3fb4]">{formatPrice(product.price)}</span><span className="flex items-center gap-1 text-xs text-[#766c7c]"><Star size={13} fill="#b47b27" className="text-[#b47b27]" /> {product.rating.toFixed(1)}</span></div><p className="arabic mt-5 text-xs leading-7 text-[#716777]">{product.description}</p><div className="mt-5 border-y border-[#e1d9e3] py-4"><p className="mb-3 text-[10px] font-bold uppercase tracking-[.14em] text-[#716777]">Details</p>{product.features.slice(0, 4).map(f => <p key={f} className="arabic mb-2 flex gap-2 text-[11px] text-[#62586a]"><Check size={13} className="mt-0.5 shrink-0 text-[#7c3fb4]" />{f}</p>)}</div><div className="mt-5"><div className="mb-2 flex items-center justify-between"><label className="text-xs font-bold text-[#473a4d]">Size <span className="text-[#7c3fb4]">{selectedSize}</span></label><button onClick={onGuide} className="flex items-center gap-1 text-[10px] font-bold text-[#7c3fb4] underline underline-offset-2" data-testid="button-quickview-size-guide"><Ruler size={13} /> Size guide</button></div><div className="flex gap-2">{product.sizes.map(size => <button key={size} onClick={() => setSelectedSize(size)} className={`min-w-12 border px-3 py-2 text-xs font-bold ${selectedSize === size ? 'border-[#7c3fb4] bg-[#7c3fb4] text-white' : 'border-[#d8cfdb] text-[#62586a] hover:border-[#7c3fb4]'}`} data-testid={`button-size-${size}`}>{size}</button>)}</div></div><div className="mt-5"><p className="mb-2 text-xs font-bold text-[#473a4d]">Color <span className="font-normal text-[#7c3fb4]">{selectedColor?.name}</span></p><div className="flex gap-2">{product.colors.map(color => <button key={color.name} onClick={() => { setSelectedColor(color); if (color.image) setImage(color.image); }} className={`h-7 w-7 rounded-full border-2 ${selectedColor?.name === color.name ? 'border-[#7c3fb4] ring-2 ring-[#d8b8ed] ring-offset-2 ring-offset-[#fbfafb]' : 'border-white'}`} style={{ background: color.hex }} aria-label={`Select ${color.name}`} data-testid={`button-color-${color.name}`} />)}</div></div><button onClick={onAdd} disabled={!product.inStock} className="mt-7 flex w-full items-center justify-center gap-2 bg-[#241c2c] py-4 text-xs font-bold text-white hover:bg-[#7c3fb4] disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-quickview-add"><ShoppingBag size={15} /> Add to bag</button><p className="mt-3 text-center text-[10px] text-[#8a808f]">Available now · inspect before payment</p></div></div></ModalShell>;
}

function CartDrawer({ cart, itemCount, subtotal, onClose, onUpdate, onRemove, onCheckout }: { cart: CartItem[]; itemCount: number; subtotal: number; onClose: () => void; onUpdate: (i: number, d: number) => void; onRemove: (i: number) => void; onCheckout: () => void }) {
  return <div className="fixed inset-0 z-[60] bg-[#1c1422]/45" role="dialog" aria-modal="true" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><aside className="drawer-enter ml-auto flex h-full w-full max-w-[450px] flex-col bg-[#fbfafb] shadow-2xl"><div className="flex items-center justify-between border-b border-[#e1d9e3] px-5 py-5"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#7c3fb4]">Your selection</p><h2 className="display-font mt-1 text-2xl font-bold tracking-[-.05em] text-[#2d2234]">Bag <span className="text-sm font-normal text-[#8b8290]">({itemCount})</span></h2></div><button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eee8f0]" aria-label="Close bag" data-testid="button-close-cart"><X size={17} /></button></div>{cart.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center px-8 text-center"><ShoppingBag size={28} className="mb-5 text-[#9e91a8]" /><h3 className="display-font text-xl font-bold text-[#34283a]">Your bag is quiet.</h3><p className="mt-2 text-sm text-[#7a707f]">A good piece might change that.</p><button onClick={onClose} className="mt-6 bg-[#241c2c] px-5 py-3 text-xs font-bold text-white" data-testid="button-continue-shopping">Continue shopping</button></div> : <><div className="flex-1 overflow-y-auto px-5 py-5">{cart.map((item, i) => <div key={`${item.product.id}-${item.size}-${item.color?.name}`} className="flex gap-3 border-b border-[#e5dee7] py-4 first:pt-0"><div className="h-24 w-20 shrink-0 overflow-hidden bg-[#2a2033]"><ProductImage src={item.color?.image || item.product.images[0]} alt={item.product.title} className="h-full w-full object-cover" /></div><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><h3 className="display-font text-sm font-bold text-[#382b3f]">{item.product.title}</h3><button onClick={() => onRemove(i)} className="text-[#978d9c] hover:text-[#b35d4f]" aria-label={`Remove ${item.product.title}`} data-testid={`button-remove-cart-${item.product.id}`}><X size={14} /></button></div><p className="mt-1 text-[10px] text-[#867b8c]">{item.size} · {item.color?.name}</p><div className="mt-4 flex items-center justify-between"><div className="flex items-center border border-[#d8cfdb]"><button onClick={() => onUpdate(i, -1)} className="p-1.5 hover:bg-[#eee8f0]" aria-label="Decrease quantity" data-testid={`button-decrease-${item.product.id}`}><Minus size={12} /></button><span className="w-7 text-center text-xs">{item.quantity}</span><button onClick={() => onUpdate(i, 1)} className="p-1.5 hover:bg-[#eee8f0]" aria-label="Increase quantity" data-testid={`button-increase-${item.product.id}`}><Plus size={12} /></button></div><span className="mono-font text-xs font-medium text-[#48384e]">{formatPrice(item.product.price * item.quantity)}</span></div></div></div>)}</div><div className="border-t border-[#ddd5e0] bg-[#f3eef4] p-5"><div className="flex items-center justify-between text-sm font-bold text-[#3c3042]"><span>Subtotal</span><span className="mono-font">{formatPrice(subtotal)}</span></div><p className="mt-2 text-[10px] text-[#837888]">Delivery is calculated by wilaya at checkout.</p><button onClick={onCheckout} className="mt-5 flex w-full items-center justify-center gap-2 bg-[#241c2c] py-4 text-xs font-bold text-white hover:bg-[#7c3fb4]" data-testid="button-proceed-checkout">Delivery details <ArrowRight size={15} /></button></div></>}</aside></div>;
}

function CheckoutModal({ cart, subtotal, onClose, onBack }: { cart: CartItem[]; subtotal: number; onClose: () => void; onBack: () => void }) {
  const [name, setName] = useState(''); const [phone, setPhone] = useState(''); const [wilaya, setWilaya] = useState(''); const [delivery, setDelivery] = useState('home'); const [sent, setSent] = useState(false);
  const deliveryFee = wilaya ? (delivery === 'home' ? (wilaya.startsWith('16') ? 450 : 650) : (wilaya.startsWith('16') ? 300 : 450)) : 0;
  function sendOrder() {
    if (!name || !phone || !wilaya) return;
    const lines = cart.map(item => `- ${item.product.title} / ${item.size} / ${item.color?.name} x${item.quantity}`).join('%0A');
    const message = `سلام Finalflash، أريد تأكيد هذا الطلب:%0A${lines}%0Aالمجموع: ${formatPrice(subtotal + deliveryFee)}%0Aالاسم: ${name}%0Aالهاتف: ${phone}%0Aالولاية: ${wilaya}%0Aالتوصيل: ${delivery === 'home' ? 'للباب' : 'للمكتب'}`;
    window.open(`https://wa.me/213778659640?text=${message}`, '_blank', 'noopener,noreferrer'); setSent(true);
  }
  return <ModalShell onClose={onClose} labelledBy="checkout-title"><div className="p-5 pt-16 sm:p-8 sm:pt-16"><button onClick={onBack} className="mb-6 flex items-center gap-1 text-xs font-bold text-[#7c3fb4]" data-testid="button-back-to-cart"><ChevronLeft size={15} /> Back to bag</button><div className="grid gap-10 lg:grid-cols-[1fr_.72fr]"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#7c3fb4]">WhatsApp checkout</p><h2 id="checkout-title" className="display-font mt-2 text-4xl font-bold tracking-[-.06em] text-[#2d2234]">Where should<br /><span className="text-[#7c3fb4]">we send it?</span></h2><p className="arabic mt-4 text-xs leading-7 text-[#746a7c]">أرسل تفاصيلك، وسنفتح لك محادثة واتساب لتأكيد الطلب معك شخصياً.</p>{sent && <div className="mt-5 flex gap-2 border border-[#bbdbbe] bg-[#eff8f0] p-3 text-xs text-[#35603a]"><Check size={15} /> WhatsApp opened. We will confirm your order shortly.</div>}<div className="mt-8 space-y-4"><label className="block text-xs font-bold text-[#4c3e52]">Full name<input value={name} onChange={e => setName(e.target.value)} className="mt-2 w-full border border-[#d8cfdb] bg-white px-3 py-3 text-sm outline-none focus:border-[#7c3fb4]" placeholder="Your name" data-testid="input-checkout-name" /></label><label className="block text-xs font-bold text-[#4c3e52]">Phone number<input value={phone} onChange={e => setPhone(e.target.value)} type="tel" className="mt-2 w-full border border-[#d8cfdb] bg-white px-3 py-3 text-sm outline-none focus:border-[#7c3fb4]" placeholder="05 xx xx xx xx" data-testid="input-checkout-phone" /></label><label className="block text-xs font-bold text-[#4c3e52]">Wilaya<select value={wilaya} onChange={e => setWilaya(e.target.value)} className="mt-2 w-full border border-[#d8cfdb] bg-white px-3 py-3 text-sm outline-none focus:border-[#7c3fb4]" data-testid="select-checkout-wilaya"><option value="">Choose your wilaya — 58 available</option>{wilayas.map(w => <option key={w}>{w}</option>)}</select></label><fieldset><legend className="mb-2 text-xs font-bold text-[#4c3e52]">Delivery method</legend><div className="grid grid-cols-2 gap-2"><label className={`cursor-pointer border p-3 text-xs ${delivery === 'home' ? 'border-[#7c3fb4] bg-[#f1e9f5]' : 'border-[#d8cfdb]'}`}><input type="radio" name="delivery" checked={delivery === 'home'} onChange={() => setDelivery('home')} className="sr-only" /><span className="block font-bold">Home delivery</span><span className="mt-1 block text-[10px] text-[#817687]">Door to door</span></label><label className={`cursor-pointer border p-3 text-xs ${delivery === 'desk' ? 'border-[#7c3fb4] bg-[#f1e9f5]' : 'border-[#d8cfdb]'}`}><input type="radio" name="delivery" checked={delivery === 'desk'} onChange={() => setDelivery('desk')} className="sr-only" /><span className="block font-bold">Desk delivery</span><span className="mt-1 block text-[10px] text-[#817687]">Pickup point</span></label></div></fieldset></div></div><div className="h-max bg-[#f2edf3] p-5"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#837689]">Order summary</p>{cart.map(item => <div key={`${item.product.id}-${item.size}`} className="mt-4 flex justify-between gap-3 text-xs"><span className="text-[#655a6b]">{item.product.title} × {item.quantity}</span><span className="mono-font text-[#403345]">{formatPrice(item.product.price * item.quantity)}</span></div>)}<div className="mt-5 border-t border-[#d9cfdd] pt-4 text-xs"><div className="flex justify-between"><span>Items</span><span className="mono-font">{formatPrice(subtotal)}</span></div><div className="mt-2 flex justify-between text-[#766b7c]"><span>Delivery estimate</span><span className="mono-font">{deliveryFee ? formatPrice(deliveryFee) : 'Choose wilaya'}</span></div><div className="mt-4 flex justify-between border-t border-[#d9cfdd] pt-4 font-bold"><span>Total</span><span className="mono-font text-[#7c3fb4]">{formatPrice(subtotal + deliveryFee)}</span></div></div><button onClick={sendOrder} disabled={!name || !phone || !wilaya} className="mt-6 flex w-full items-center justify-center gap-2 bg-[#7c3fb4] py-3.5 text-xs font-bold text-white hover:bg-[#241c2c] disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-send-whatsapp">Send order on WhatsApp <ArrowRight size={15} /></button><p className="mt-4 flex gap-2 text-[10px] leading-5 text-[#817687]"><ShieldCheck size={13} className="shrink-0 text-[#7c3fb4]" /> No online payment. Pay after checking your parcel.</p></div></div></div></ModalShell>;
}

function SizeGuide({ tab, setTab, onClose }: { tab: string; setTab: (tab: string) => void; onClose: () => void }) {
  const guides: Record<string, { title: string; tip: string; headers: string[]; rows: string[][] }> = { jogger: { title: 'Baggy Jogger sizing', tip: 'قصتنا فضفاضة مع خصر مطاطي ورباط قابل للتعديل.', headers: ['Size', 'Height', 'Weight', 'Length'], rows: [['M', '160–173 cm', '52–68 kg', '98 cm'], ['L', '172–182 cm', '68–83 kg', '102 cm'], ['XL', '180–195 cm', '83–100 kg', '106 cm']] }, tshirts: { title: 'T-shirt sizing', tip: 'قصات مريحة بطابع streetwear.', headers: ['Size', 'Height', 'Weight', 'Chest'], rows: [['S', '155–168 cm', '48–62 kg', '50 cm'], ['M', '168–178 cm', '62–76 kg', '54 cm'], ['L', '176–185 cm', '75–88 kg', '58 cm'], ['XL', '182–195 cm', '88–105 kg', '62 cm']] }, shoes: { title: 'Shoe sizing', tip: 'Converse All Star uses standard EU sizing.', headers: ['EU', 'Foot length', 'US Men', 'US Women'], rows: [['38', '24.0 cm', '5.5', '7.5'], ['39', '24.5 cm', '6.0', '8.0'], ['40', '25.5 cm', '7.0', '9.0'], ['41', '26.0 cm', '7.5', '9.5'], ['42', '26.5 cm', '8.5', '10.5']] } };
  const guide = guides[tab];
  return <ModalShell onClose={onClose} labelledBy="size-guide-title"><div className="p-5 pt-16 sm:p-8 sm:pt-16"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#7c3fb4]">Find your fit</p><h2 id="size-guide-title" className="display-font mt-2 text-4xl font-bold tracking-[-.06em] text-[#2d2234]">Size guide</h2><div className="mt-7 flex border-b border-[#ded5e1]">{Object.entries({ jogger: 'Jogger', tshirts: 'T-shirts', shoes: 'Shoes' }).map(([key, label]) => <button key={key} onClick={() => setTab(key)} className={`border-b-2 px-4 py-3 text-xs font-bold ${tab === key ? 'border-[#7c3fb4] text-[#7c3fb4]' : 'border-transparent text-[#847989]'}`} data-testid={`button-guide-tab-${key}`}>{label}</button>)}</div><p className="arabic mt-6 text-xs text-[#6e6475]">{guide.tip}</p><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[430px] border-collapse text-left text-xs"><thead><tr className="border-b border-[#d9d0dd]">{guide.headers.map(header => <th key={header} className="px-3 py-3 text-[10px] uppercase tracking-[.08em] text-[#817687]">{header}</th>)}</tr></thead><tbody>{guide.rows.map(row => <tr key={row[0]} className="border-b border-[#e9e2eb]">{row.map((cell, i) => <td key={cell} className={`px-3 py-4 ${i === 0 ? 'font-bold text-[#7c3fb4]' : 'text-[#62586a]'}`}>{cell}</td>)}</tr>)}</tbody></table></div><p className="mt-6 text-[10px] leading-5 text-[#897f8e]">Between sizes? For the relaxed Finalflash fit, choose the larger size. Message us on WhatsApp if you want a second opinion.</p></div></ModalShell>;
}

function Lightbox({ index, onClose, onMove }: { index: number; onClose: () => void; onMove: (delta: number) => void }) {
  const item = feedbacks[index];
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#17101d]/90 p-5" role="dialog" aria-modal="true" aria-label="Customer feedback image" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><div className="relative max-w-[500px]"><ProductImage src={item.image} alt={item.title} className="max-h-[76dvh] max-w-full object-contain" fallbackLabel="CUSTOMER FEEDBACK" /><div className="mt-4 flex items-center justify-between text-white"><div><p className="text-sm font-bold">{item.title}</p><p className="mt-1 text-xs text-[#c7b3cf]">{item.tag} · {index + 1} / {feedbacks.length}</p></div><div className="flex gap-2"><button onClick={() => onMove(-1)} className="flex h-9 w-9 items-center justify-center border border-white/30 hover:bg-white hover:text-[#241a30]" aria-label="Previous feedback" data-testid="button-previous-feedback"><ChevronLeft size={17} /></button><button onClick={() => onMove(1)} className="flex h-9 w-9 items-center justify-center border border-white/30 hover:bg-white hover:text-[#241a30]" aria-label="Next feedback" data-testid="button-next-feedback"><ChevronRight size={17} /></button><button onClick={onClose} className="flex h-9 w-9 items-center justify-center border border-white/30 hover:bg-white hover:text-[#241a30]" aria-label="Close feedback" data-testid="button-close-feedback"><X size={17} /></button></div></div></div></div>;
}

export default function RootApp() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><ErrorBoundary><App /></ErrorBoundary><Toaster /></TooltipProvider></QueryClientProvider>;
}