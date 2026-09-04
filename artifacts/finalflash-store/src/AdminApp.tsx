import { useEffect, useMemo, useState } from 'react';

type OrderItem = {
  productTitle: string;
  size: string;
  color: string | null;
  quantity: number;
  unitPrice: number;
};

type AuditLog = {
  id: number;
  orderId: number;
  action: string;
  previousStatus: string | null;
  newStatus: string;
  changedBy: string;
  notes: string | null;
  createdAt: string;
};

type Order = {
  id: number;
  orderNumber: string;
  customerName: string;
  phone: string;
  wilaya: string;
  commune: string;
  deliveryMethod: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

type AdminProduct = {
  id: number;
  title: string;
  category: string;
  price: number;
  badge: string | null;
  isOneOfOne: boolean;
  inStock: boolean;
  stockCount: number;
  quality: string | null;
  conditionDetails: string | null;
  sizes: string[];
  colors: Array<{ name: string; hex?: string }>;
  images: string[];
  description: string;
  isReserved?: boolean;
};

const statuses = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const statusLabels: Record<string, string> = {
  new: 'جديد (New)',
  confirmed: 'مؤكد (Confirmed)',
  shipped: 'تم الشحن (Shipped)',
  delivered: 'تم التسليم (Delivered)',
  cancelled: 'ملغى (Cancelled)',
};

const categoryLabels: Record<string, string> = {
  pants: 'بناطيل وجوغر (Pants)',
  tshirts: 'تيشيرتات (T-Shirts)',
  shoes: 'أحذية (Shoes)',
  bundle: 'طقم كامل (Bundle)',
  jackets: 'سترات وجاكيتات (Jackets)',
};

function formatPrice(value: number) {
  return `${value.toLocaleString('fr-FR')} DA`;
}

export default function AdminApp() {
  const [key, setKey] = useState(() => sessionStorage.getItem('finalflash_admin_key') || '');
  const [currentTab, setCurrentTab] = useState<'orders' | 'products'>('orders');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Products State
  const [productsList, setProductsList] = useState<AdminProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Product Form State
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('3500');
  const [newCategory, setNewCategory] = useState('tshirts');
  const [newIsOneOfOne, setNewIsOneOfOne] = useState(true);
  const [newBadge, setNewBadge] = useState('THRIFT 1 OF 1');
  const [newQuality, setNewQuality] = useState('10/10 أصلي بحالة الوكالة');
  const [newSizes, setNewSizes] = useState('M');
  const [newColor, setNewColor] = useState('Black');
  const [newImage, setNewImage] = useState('gymshark-front.jpg');
  const [newDescription, setNewDescription] = useState('');
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Audit Log Modal State
  const [activeAuditOrder, setActiveAuditOrder] = useState<Order | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  async function loadOrders() {
    if (!key.trim()) {
      setMessage('يرجى إدخال مفتاح الإدارة (ADMIN_KEY) أولاً.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/orders', {
        headers: {
          'X-Admin-Key': key.trim(),
          'Authorization': `Bearer ${key.trim()}`,
        },
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'تعذر تحميل الطلبات. تأكد من صحة المفتاح.');
      sessionStorage.setItem('finalflash_admin_key', key.trim());
      setOrders(Array.isArray(body) ? body : body.orders || []);
      setCurrentPage(1);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'تعذر تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts() {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProductsList(Array.isArray(data) ? data : []);
      }
    } catch {
      setMessage('تعذر جلب قائمة المنتجات');
    } finally {
      setLoadingProducts(false);
    }
  }

  async function toggleProductStock(prodId: number, currentInStock: boolean) {
    if (!key.trim()) {
      setMessage('يرجى إدخال مفتاح الإدارة أولاً لتعديل المخزون.');
      return;
    }
    try {
      const res = await fetch(`/api/products/${prodId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': key.trim(),
        },
        body: JSON.stringify({ inStock: !currentInStock }),
      });
      if (!res.ok) throw new Error('فشل تحديث حالة المنتج');
      const updated = await res.json();
      setProductsList((prev) =>
        prev.map((p) => (p.id === prodId ? { ...p, inStock: updated.inStock } : p))
      );
      setMessage(`تم تحديث حالة القطعة إلى: ${updated.inStock ? 'متوفرة في المتجر' : 'غير متوفرة (Sold Out)'}`);
    } catch (err: any) {
      setMessage(err.message || 'خطأ أثناء تحديث حالة المنتج');
    }
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim()) {
      setMessage('يرجى إدخال مفتاح الإدارة (ADMIN_KEY) لحفظ القطعة.');
      return;
    }
    if (!newTitle.trim() || !newPrice.trim()) {
      setMessage('يرجى إدخال اسم القطعة وسعرها.');
      return;
    }

    setSubmittingProduct(true);
    setMessage('');
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': key.trim(),
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          price: Number(newPrice),
          category: newCategory,
          isOneOfOne: newIsOneOfOne,
          badge: newBadge.trim(),
          quality: newQuality.trim(),
          sizes: newSizes.split(',').map((s) => s.trim()).filter(Boolean),
          colors: newColor.split(',').map((c) => ({ name: c.trim() })).filter((c) => c.name),
          images: [newImage.trim() || 'jogger-black.jpg'],
          description: newDescription.trim() || 'قطعة ستريت وير أصلية منتقاة بعناية لمتجر Finalflash.',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل حفظ القطعة');

      setMessage(`✅ تم إضافة القطعة "${data.title}" بنجاح ونشرها في المتجر فوراً!`);
      setShowAddModal(false);
      setNewTitle('');
      setNewDescription('');
      void loadProducts();
    } catch (err: any) {
      setMessage(err.message || 'تعذر إضافة القطعة');
    } finally {
      setSubmittingProduct(false);
    }
  }

  async function updateStatus(orderId: number, nextStatus: string, notes?: string) {
    setMessage('');
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': key.trim(),
          'Authorization': `Bearer ${key.trim()}`,
        },
        body: JSON.stringify({ status: nextStatus, notes: notes || 'تحديث من لوحة الإدارة' }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'تعذر تحديث الحالة');
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? { ...order, status: body.status } : order))
      );
      setMessage(`تم تحديث حالة الطلب إلى: ${statusLabels[nextStatus] || nextStatus}`);
      if (activeAuditOrder && activeAuditOrder.id === orderId) {
        void fetchAuditLogs(activeAuditOrder);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'تعذر تحديث الحالة');
    }
  }

  async function fetchAuditLogs(order: Order) {
    setActiveAuditOrder(order);
    setLoadingLogs(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/audit-logs`, {
        headers: {
          'X-Admin-Key': key.trim(),
          'Authorization': `Bearer ${key.trim()}`,
        },
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'تعذر جلب سجل التدقيق');
      setAuditLogs(Array.isArray(body) ? body : []);
    } catch (err) {
      setAuditLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  }

  useEffect(() => {
    void loadProducts();
    if (key) void loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = status === 'all' || order.status === status;
      const matchesSearch =
        !query ||
        [order.orderNumber, order.customerName, order.phone, order.wilaya, order.commune]
          .join(' ')
          .toLowerCase()
          .includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, status]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return productsList;
    return productsList.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.badge && p.badge.toLowerCase().includes(q))
    );
  }, [productsList, productSearch]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  return (
    <main dir="rtl" className="min-h-screen bg-[#f7f5f8] px-4 py-8 text-[#281f30] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 border-b border-[#ded7e2] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-[.2em] text-[#7c3fb4]">FINALFLASH / ENTERPRISE ADMIN</p>
            </div>
            <h1 className="display-font mt-2 text-4xl font-bold tracking-tight text-[#241c2c]">إدارة المتجر والطلبات</h1>
            <p className="mt-2 text-sm text-[#746a7c]">
              لوحة تحكم مركزية لمتابعة الطلبات اللحظية، وإضافة قطع الثريفت الجديدة ونشرها في المتجر مباشرة.
            </p>
          </div>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-[#241c2c] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#7c3fb4] transition-colors shadow-sm"
          >
            ← العودة إلى المتجر
          </a>
        </header>

        {/* Authentication Section */}
        <section className="mb-6 grid gap-3 rounded-xl border border-[#ded7e2] bg-white p-5 shadow-sm md:grid-cols-[1fr_auto]">
          <label className="text-sm font-bold text-[#241c2c]">
            مفتاح الإدارة السري (ADMIN_KEY)
            <input
              type="password"
              value={key}
              onChange={(event) => setKey(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void loadOrders();
              }}
              placeholder="أدخل مفتاح الإدارة السري هنا..."
              className="mt-2 w-full rounded border border-[#d8cfdb] px-3 py-3 font-mono text-sm outline-none focus:border-[#7c3fb4]"
              autoComplete="current-password"
            />
          </label>
          <button
            onClick={() => void loadOrders()}
            disabled={loading}
            className="self-end rounded bg-[#7c3fb4] px-6 py-3 text-sm font-bold text-white hover:bg-[#682f9d] disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading ? 'جاري التحميل...' : 'تأكيد المفتاح وتحميل البيانات'}
          </button>
        </section>

        {message && (
          <div role="status" className="mb-5 rounded-lg border border-[#d7c3e4] bg-[#f5edf9] p-4 text-sm font-medium text-[#4a2b66]">
            {message}
          </div>
        )}

        {/* Main Navigation Tabs */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#ded7e2] pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentTab('orders')}
              className={`rounded-lg px-5 py-2.5 text-sm font-bold transition-all ${
                currentTab === 'orders'
                  ? 'bg-[#241c2c] text-white shadow'
                  : 'bg-white text-[#63556d] hover:bg-[#ede7f2]'
              }`}
            >
              📦 الطلبات والمبيعات ({orders.length})
            </button>
            <button
              onClick={() => {
                setCurrentTab('products');
                void loadProducts();
              }}
              className={`rounded-lg px-5 py-2.5 text-sm font-bold transition-all ${
                currentTab === 'products'
                  ? 'bg-[#241c2c] text-white shadow'
                  : 'bg-white text-[#63556d] hover:bg-[#ede7f2]'
              }`}
            >
              🏷️ القطع والمخزون ({productsList.length})
            </button>
          </div>

          {currentTab === 'products' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#7c3fb4] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#662f98] transition-colors"
            >
              ➕ إضافة قطعة ثريفت جديدة
            </button>
          )}
        </div>

        {/* ======================= TAB 1: ORDERS ======================= */}
        {currentTab === 'orders' && (
          <>
            <section className="mb-5 flex flex-col gap-3 rounded-xl border border-[#ded7e2] bg-white p-4 sm:flex-row">
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="بحث برقم الطلب، اسم العميل، الهاتف، الولاية، أو البلدية..."
                className="flex-1 rounded border border-[#d8cfdb] px-3 py-3 text-sm outline-none focus:border-[#7c3fb4]"
              />
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setCurrentPage(1);
                }}
                className="rounded border border-[#d8cfdb] px-3 py-3 text-sm font-medium outline-none focus:border-[#7c3fb4]"
              >
                <option value="all">كل الحالات ({orders.length})</option>
                {statuses.map((value) => (
                  <option key={value} value={value}>
                    {statusLabels[value]}
                  </option>
                ))}
              </select>
            </section>

            <div className="mb-3 flex items-center justify-between text-sm font-semibold text-[#746a7c]">
              <span>إجمالي النتائج: {filteredOrders.length} طلب</span>
              <span>الصفحة {currentPage} من {totalPages}</span>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="rounded-xl border border-[#ded7e2] bg-white p-8 text-center text-sm text-[#746a7c]">
                لا توجد طلبات تطابق هذا البحث أو لم يتم تسجيل الدخول بمفتاح صالح بعد.
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedOrders.map((order) => (
                  <article key={order.id} className="rounded-xl border border-[#ded7e2] bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-[#eee8f0] pb-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-lg font-bold text-[#7c3fb4]">{order.orderNumber}</span>
                          <span className="rounded bg-[#f1e9f5] px-2.5 py-1 text-xs font-bold text-[#4e2d6b]">
                            {statusLabels[order.status] || order.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[#746a7c]">
                          {new Date(order.createdAt).toLocaleString('ar-DZ')}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(event) => void updateStatus(order.id, event.target.value)}
                          className="rounded border border-[#d8cfdb] bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#7c3fb4]"
                        >
                          {statuses.map((item) => (
                            <option key={item} value={item}>
                              {statusLabels[item]}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => void fetchAuditLogs(order)}
                          className="rounded border border-[#7c3fb4] px-3 py-2 text-xs font-bold text-[#7c3fb4] hover:bg-[#7c3fb4] hover:text-white transition-colors"
                        >
                          سجل التدقيق 📋
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 text-xs sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="text-[#84778d]">العميل</p>
                        <p className="font-bold text-[#241c2c]">{order.customerName}</p>
                        <a
                          href={`https://wa.me/213${order.phone.replace(/^0/, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 font-mono text-[#7c3fb4] underline hover:text-[#5e2891]"
                        >
                          {order.phone} 💬 (واتساب)
                        </a>
                      </div>
                      <div>
                        <p className="text-[#84778d]">التوصيل</p>
                        <p className="font-bold text-[#241c2c]">{order.wilaya} — {order.commune}</p>
                        <p className="text-[#64596b]">{order.deliveryMethod === 'home' ? 'لباب المنزل' : 'استلام من المكتب'}</p>
                      </div>
                      <div>
                        <p className="text-[#84778d]">القطع</p>
                        <p className="font-bold text-[#241c2c]">{order.items?.length || 0} قطع</p>
                        <p className="text-[#64596b]">رسوم التوصيل: {formatPrice(order.deliveryFee)}</p>
                      </div>
                      <div>
                        <p className="text-[#84778d]">المجموع الإجمالي</p>
                        <p className="font-mono text-base font-bold text-[#7c3fb4]">{formatPrice(order.total)}</p>
                        <p className="text-[#64596b]">الدفع عند الاستلام</p>
                      </div>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="mt-4 border-t border-[#f4f1f6] pt-3">
                        <p className="mb-2 text-[11px] font-bold text-[#84778d]">تفاصيل المشتريات:</p>
                        <div className="flex flex-wrap gap-2">
                          {order.items.map((item, idx) => (
                            <span key={idx} className="rounded bg-[#f7f5f8] px-2.5 py-1 text-xs text-[#413647]">
                              {item.productTitle} ({item.size} {item.color ? `/ ${item.color}` : ''}) × {item.quantity} —{' '}
                              <strong>{formatPrice(item.unitPrice * item.quantity)}</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                ))}

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 pt-4">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded border border-[#ded7e2] bg-white px-3 py-1.5 text-xs font-bold disabled:opacity-40"
                    >
                      السابق
                    </button>
                    <span className="px-3 py-1.5 text-xs font-bold text-[#746a7c]">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded border border-[#ded7e2] bg-white px-3 py-1.5 text-xs font-bold disabled:opacity-40"
                    >
                      التالي
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ======================= TAB 2: PRODUCTS ======================= */}
        {currentTab === 'products' && (
          <div className="space-y-4">
            <section className="flex flex-col gap-3 rounded-xl border border-[#ded7e2] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="بحث عن قطعة بالاسم أو التصنيف..."
                className="w-full sm:max-w-md rounded border border-[#d8cfdb] px-3 py-2.5 text-sm outline-none focus:border-[#7c3fb4]"
              />
              <span className="text-xs text-[#746a7c]">
                القطع المعروضة: <strong>{filteredProducts.length}</strong>
              </span>
            </section>

            {loadingProducts ? (
              <p className="py-12 text-center text-sm text-[#746a7c]">جاري تحميل القطع من قاعدة البيانات...</p>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-xl border border-[#ded7e2] bg-white p-8 text-center text-sm text-[#746a7c]">
                لا توجد قطع مطابقة للبحث. يمكنك إضافة قطعة جديدة بالضغط على زر "إضافة قطعة ثريفت جديدة".
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((prod) => (
                  <article key={prod.id} className="flex flex-col justify-between rounded-xl border border-[#ded7e2] bg-white p-4 shadow-sm">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="rounded bg-[#241c2c] px-2 py-0.5 text-[9px] font-bold text-white">
                            {prod.badge || (prod.isOneOfOne ? 'THRIFT 1 OF 1' : 'REGULAR')}
                          </span>
                          <h3 className="mt-2 text-base font-bold text-[#241c2c]">{prod.title}</h3>
                          <p className="text-xs text-[#7c3fb4]">{categoryLabels[prod.category] || prod.category}</p>
                        </div>
                        <span className="font-mono text-sm font-bold text-[#7c3fb4]">{formatPrice(prod.price)}</span>
                      </div>

                      <div className="mt-3 space-y-1 text-xs text-[#63556d]">
                        <p>المقاسات: <strong>{Array.isArray(prod.sizes) ? prod.sizes.join(', ') : prod.sizes}</strong></p>
                        <p>الألوان: <strong>{Array.isArray(prod.colors) ? prod.colors.map((c) => c.name || c).join(', ') : 'Standard'}</strong></p>
                        {prod.quality && <p>الحالة: <em>{prod.quality}</em></p>}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[#f4f1f6] pt-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            prod.isReserved
                              ? 'bg-amber-500'
                              : prod.inStock
                              ? 'bg-emerald-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        <span className="text-xs font-bold text-[#44384a]">
                          {prod.isReserved ? 'محجوزة لزبون (مؤقتاً)' : prod.inStock ? 'متوفرة في المتجر' : 'نفذت الكمية (Sold Out)'}
                        </span>
                      </div>

                      <button
                        onClick={() => void toggleStock(prod.id, prod.inStock)}
                        className={`rounded px-3 py-1.5 text-xs font-bold transition-colors ${
                          prod.inStock
                            ? 'bg-[#ffe8e8] text-[#a13333] hover:bg-[#ffcfcf]'
                            : 'bg-[#e7f7ed] text-[#1e7e45] hover:bg-[#d0f0dc]'
                        }`}
                      >
                        {prod.inStock ? 'تعيين كـ غير متوفر' : 'تعيين كـ متوفر'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================= MODAL: ADD PRODUCT ======================= */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c1422]/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#eee8f0] pb-4">
                <h3 className="text-lg font-bold text-[#241c2c]">➕ إضافة قطعة ثريفت / ستريت وير جديدة</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg bg-[#f1e9f5] px-3 py-1.5 text-xs font-bold text-[#4e2d6b] hover:bg-[#e4d5ea]"
                >
                  إغلاق ✕
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="mt-4 space-y-4 text-xs font-bold text-[#3e3245]">
                <div>
                  <label className="block mb-1">اسم القطعة (Product Title) *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="مثال: Vintage Carhartt Detroit Jacket"
                    className="w-full rounded border border-[#d8cfdb] px-3 py-2 text-sm font-normal outline-none focus:border-[#7c3fb4]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">السعر بالدينار (DA) *</label>
                    <input
                      type="number"
                      required
                      min="100"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="3500"
                      className="w-full rounded border border-[#d8cfdb] px-3 py-2 text-sm font-mono outline-none focus:border-[#7c3fb4]"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">التصنيف (Category) *</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full rounded border border-[#d8cfdb] px-3 py-2 text-sm outline-none focus:border-[#7c3fb4]"
                    >
                      <option value="tshirts">تيشيرت (T-Shirts)</option>
                      <option value="pants">بناطيل (Pants)</option>
                      <option value="jogger">جوغر (Jogger)</option>
                      <option value="shoes">أحذية (Shoes)</option>
                      <option value="jackets">سترات (Jackets)</option>
                      <option value="bundle">طقم كامل (Bundle)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-[#eee8f0] bg-[#faf8fb] p-3">
                  <input
                    type="checkbox"
                    id="isOneOfOneCheck"
                    checked={newIsOneOfOne}
                    onChange={(e) => setNewIsOneOfOne(e.target.checked)}
                    className="h-4 w-4 accent-[#7c3fb4]"
                  />
                  <label htmlFor="isOneOfOneCheck" className="cursor-pointer text-xs">
                    قطعة ثريفت فريدة 1 of 1 (الكمية محددة بـ 1 مع حماية ذرية من البيع المزدوج)
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">المقاسات المتاحة (مفصولة بفواصل)</label>
                    <input
                      type="text"
                      value={newSizes}
                      onChange={(e) => setNewSizes(e.target.value)}
                      placeholder="S, M, L أو W32-34"
                      className="w-full rounded border border-[#d8cfdb] px-3 py-2 text-xs font-normal outline-none focus:border-[#7c3fb4]"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">اللون</label>
                    <input
                      type="text"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      placeholder="Black, Duck Brown, Navy..."
                      className="w-full rounded border border-[#d8cfdb] px-3 py-2 text-xs font-normal outline-none focus:border-[#7c3fb4]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">الشارة (Badge)</label>
                    <input
                      type="text"
                      value={newBadge}
                      onChange={(e) => setNewBadge(e.target.value)}
                      placeholder="THRIFT 1 OF 1 / RARE"
                      className="w-full rounded border border-[#d8cfdb] px-3 py-2 text-xs font-normal outline-none focus:border-[#7c3fb4]"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">حالة النظافة (Quality)</label>
                    <input
                      type="text"
                      value={newQuality}
                      onChange={(e) => setNewQuality(e.target.value)}
                      placeholder="10/10 أصلي بحالة ممتازة"
                      className="w-full rounded border border-[#d8cfdb] px-3 py-2 text-xs font-normal outline-none focus:border-[#7c3fb4]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1">اسم الصورة أو الرابط (في مجلد images/)</label>
                  <input
                    type="text"
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    placeholder="gymshark-front.jpg أو رابط خارجي https://..."
                    className="w-full rounded border border-[#d8cfdb] px-3 py-2 text-xs font-mono font-normal outline-none focus:border-[#7c3fb4]"
                  />
                  <span className="mt-1 block text-[10px] font-normal text-[#8a7f92]">
                    يمكنك كتابة اسم أي صورة موجودة في مجلد public/images أو وضع رابط ويب مباشر للصورة.
                  </span>
                </div>

                <div>
                  <label className="block mb-1">الوصف وقصة القطعة (Description)</label>
                  <textarea
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="اكتب وصفاً مفصلاً يبرز أصالة القطعة، القماش، وقصتها..."
                    className="w-full rounded border border-[#d8cfdb] px-3 py-2 text-xs font-normal outline-none focus:border-[#7c3fb4]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[#eee8f0]">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded border border-[#d8cfdb] px-4 py-2 text-xs font-bold text-[#62556b] hover:bg-[#f5f1f7]"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submittingProduct}
                    className="rounded bg-[#7c3fb4] px-5 py-2 text-xs font-bold text-white hover:bg-[#682f9d] disabled:opacity-50"
                  >
                    {submittingProduct ? 'جاري الحفظ...' : 'حفظ ونشر القطعة في المتجر فوراً'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================= MODAL: AUDIT LOGS ======================= */}
        {activeAuditOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c1422]/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#eee8f0] pb-4">
                <div>
                  <h3 className="font-mono text-lg font-bold text-[#7c3fb4]">
                    سجل التدقيق للطلب: {activeAuditOrder.orderNumber}
                  </h3>
                  <p className="text-xs text-[#746a7c]">تاريخ كافة التغييرات التي طرأت على هذا الطلب</p>
                </div>
                <button
                  onClick={() => setActiveAuditOrder(null)}
                  className="rounded-lg bg-[#f1e9f5] px-3 py-1.5 text-xs font-bold text-[#4e2d6b] hover:bg-[#e4d5ea]"
                >
                  إغلاق ✕
                </button>
              </div>

              <div className="mt-4 max-h-80 space-y-3 overflow-y-auto">
                {loadingLogs ? (
                  <p className="py-8 text-center text-sm text-[#746a7c]">جاري تحميل السجل...</p>
                ) : auditLogs.length === 0 ? (
                  <p className="py-8 text-center text-sm text-[#746a7c]">لا توجد سجلات تعديل مسجلة لهذا الطلب.</p>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="rounded-lg border border-[#eee8f0] bg-[#faf8fb] p-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#241c2c]">
                          {log.action === 'order_created' ? 'إنشاء الطلب' : 'تغيير الحالة'}
                        </span>
                        <span className="text-[#96899d]">
                          {new Date(log.createdAt).toLocaleString('ar-DZ')}
                        </span>
                      </div>
                      <p className="mt-1 text-[#5f5566]">
                        {log.previousStatus ? `من "${statusLabels[log.previousStatus] || log.previousStatus}" إلى ` : ''}
                        <strong>"{statusLabels[log.newStatus] || log.newStatus}"</strong> بواسطة:{' '}
                        <span className="font-mono">{log.changedBy}</span>
                      </p>
                      {log.notes && <p className="mt-1 text-[#8b7e93] italic">ملاحظات: {log.notes}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
