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

const statuses = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const statusLabels: Record<string, string> = {
  new: 'جديد (New)',
  confirmed: 'مؤكد (Confirmed)',
  shipped: 'تم الشحن (Shipped)',
  delivered: 'تم التسليم (Delivered)',
  cancelled: 'ملغى (Cancelled)',
};

function formatPrice(value: number) {
  return `${value.toLocaleString('fr-FR')} DA`;
}

export default function AdminApp() {
  const [key, setKey] = useState(() => sessionStorage.getItem('finalflash_admin_key') || '');
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
          'Authorization': `Bearer ${key.trim()}`
        }
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

  async function updateStatus(orderId: number, nextStatus: string, notes?: string) {
    setMessage('');
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': key.trim(),
          'Authorization': `Bearer ${key.trim()}`
        },
        body: JSON.stringify({ status: nextStatus, notes: notes || 'تحديث من لوحة الإدارة' }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'تعذر تحديث الحالة');
      setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status: body.status } : order)));
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
          'Authorization': `Bearer ${key.trim()}`
        }
      });
      const body = await response.json();
      setAuditLogs(Array.isArray(body) ? body : []);
    } catch (err) {
      setAuditLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  }

  useEffect(() => {
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
            <h1 className="display-font mt-2 text-4xl font-bold tracking-tight text-[#241c2c]">إدارة الطلبات وسجل التدقيق</h1>
            <p className="mt-2 text-sm text-[#746a7c]">
              لوحة تحكم مشفّرة متصلة بالخادم المركزي مع تتبع لحظي لتاريخ تعديل كل طلب (Audit Logs).
            </p>
          </div>
          <a href="/" className="inline-flex items-center gap-2 rounded-lg bg-[#241c2c] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#7c3fb4] transition-colors shadow-sm">
            ← العودة إلى المتجر
          </a>
        </header>

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
            {loading ? 'جاري التحميل...' : 'تحميل الطلبات'}
          </button>
        </section>

        {message && (
          <div role="status" className="mb-5 rounded-lg border border-[#d7c3e4] bg-[#f5edf9] p-4 text-sm font-medium text-[#4a2b66]">
            {message}
          </div>
        )}

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

        <section className="space-y-4">
          {paginatedOrders.map((order) => (
            <article key={order.id} className="rounded-xl border border-[#ded7e2] bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-4 border-b border-[#eee8f0] pb-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-mono text-lg font-bold text-[#7c3fb4]">{order.orderNumber}</h2>
                    <span className="rounded-full bg-[#f1e9f5] px-3 py-1 text-xs font-bold text-[#4e2d6b]">
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-bold text-[#241c2c]">
                    👤 {order.customerName} · 📞 {order.phone}
                  </p>
                  <p className="mt-1 text-sm text-[#746a7c]">
                    📍 {order.wilaya} {order.commune ? `(${order.commune})` : ''} · 🚚 {order.deliveryMethod}
                  </p>
                  <p className="mt-1 text-xs text-[#96899d]">
                    🕒 {new Date(order.createdAt).toLocaleString('ar-DZ')}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <span className="font-mono text-xl font-bold text-[#241c2c]">{formatPrice(order.total)}</span>
                  <select
                    value={order.status}
                    onChange={(event) => void updateStatus(order.id, event.target.value)}
                    className="rounded border border-[#d8cfdb] px-3 py-2 text-sm font-semibold outline-none focus:border-[#7c3fb4]"
                  >
                    {statuses.map((value) => (
                      <option key={value} value={value}>
                        {statusLabels[value]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-[#5f5566] md:grid-cols-2">
                {order.items.map((item, index) => (
                  <p key={`${order.id}-${index}`} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#7c3fb4]" />
                    <strong className="text-[#241c2c]">{item.productTitle}</strong> × {item.quantity} · مقاس {item.size} {item.color ? `· لون ${item.color}` : ''} · {formatPrice(item.unitPrice)}
                  </p>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[#eee8f0] pt-3 text-xs text-[#746a7c]">
                <div className="flex gap-4">
                  <span>القطع: <strong>{formatPrice(order.subtotal)}</strong></span>
                  <span>التوصيل: <strong>{formatPrice(order.deliveryFee)}</strong></span>
                  <button
                    onClick={() => void fetchAuditLogs(order)}
                    className="font-bold text-[#7c3fb4] hover:underline"
                  >
                    📜 سجل التعديلات (Audit Log)
                  </button>
                </div>
                <a
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#25d366]/10 px-3 py-1.5 font-bold text-[#128c7e] hover:bg-[#25d366]/20 transition-colors"
                  href={`https://wa.me/${order.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`مرحباً ${order.customerName}، معك متجر FINALFLASH بخصوص طلبك رقم ${order.orderNumber}.`)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  💬 فتح محادثة WhatsApp مع الزبون
                </a>
              </div>
            </article>
          ))}

          {filteredOrders.length === 0 && (
            <div className="rounded-xl border border-dashed border-[#cfc2d5] bg-white p-12 text-center text-sm text-[#746a7c]">
              لا توجد طلبات مطابقة للبحث أو لم يتم تحميل الطلبات بعد.
            </div>
          )}
        </section>

        {/* Pagination Navigation */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-[#ded7e2] bg-white px-4 py-2 text-sm font-bold disabled:opacity-40 hover:bg-[#f3edf7] transition-colors"
            >
              الصفحة السابقة
            </button>
            <span className="px-3 text-sm font-semibold text-[#746a7c]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-[#ded7e2] bg-white px-4 py-2 text-sm font-bold disabled:opacity-40 hover:bg-[#f3edf7] transition-colors"
            >
              الصفحة التالية
            </button>
          </div>
        )}

        {/* Audit Log Modal */}
        {activeAuditOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
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
                        <strong>"{statusLabels[log.newStatus] || log.newStatus}"</strong> بواسطة: <span className="font-mono">{log.changedBy}</span>
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
