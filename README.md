# FINALFLASH — Algerian Streetwear & Thrift Boutique ⚡🇩🇿

منصة تجارة إلكترونية متطورة مخصصة لعلامة الستريت وير والثريفت الجزائري **FINALFLASH** (*RARE BY CHOICE*)، تغطي الـ 58 ولاية بنظام الدفع عند الاستلام (COD) وتكامل مباشر مع WhatsApp ولوحة إدارة سحابية.

---

## 🏗️ البنية البرمجية (Monorepo Architecture)

المشروع مبني بهيكلية **Monorepo** باستخدام `pnpm workspaces`:

- **`artifacts/finalflash-store`**: واجهة المتجر للزبائن ولوحة الإدارة مبنية بـ **React 19 + TypeScript + Vite + Tailwind CSS v4**.
- **`artifacts/api-server`**: خادم خلفي آمن مبني بـ **Node.js + Express 5 + Drizzle ORM + Pino Logger**.
- **`lib/db`**: طبقة قاعدة البيانات المشتركة **PostgreSQL** عبر **Drizzle ORM**.
- **`lib/api-spec` & `lib/api-zod`**: مواصفة الـ API المشتركة عبر **OpenAPI + Zod Schemas**.

---

## 🛡️ ميزات الأمان والهندسة المحققة (Security & Engineering)

1. **تسعير خادم حصري (Server-Authoritative Pricing):**
   - السيرفر هو مصدر الحقيقة الوحيد لكافة الأسعار ورسوم التوصيل للـ 58 ولاية.
   - منع أي محاولة لتعديل الأسعار من جهة العميل (DevTools / Postman).
2. **حجز ذري لقطع الأرشيف (Atomic 1-of-1 Inventory Locks):**
   - جدول `inventory_reservations` مع قيد فريد `UNIQUE(product_id)` في قاعدة البيانات.
   - يستحيل بيع نفس القطعة النادرة لعميلين في نفس اللحظة (منع الـ Race Conditions).
3. **لوحة تحكم مشفرة للمدير (`/admin`):**
   - مسار `/admin` محمي بـ `ADMIN_KEY` بدون أي مفاتيح افتراضية داخل الكود.
   - بحث شامل برقم الطلب، اسم العميل، الهاتف، والولاية.
   - فلترة وتحديث حالات الطلبات (`new` → `confirmed` → `shipped` → `delivered` → `cancelled`).
   - زر مباشر لفتح محادثة واتساب مع الزبون لتأكيد الطلب.
4. **حماية CORS الصارمة:**
   - قصر الاتصالات على النطاق الرسمي `https://finalflash.dz` ومنافذ التطوير المعتمدة.
5. **صفر ثغرات أمنية (0 Vulnerabilities):**
   - فحص `pnpm audit --prod` خالٍ تماماً من أي ثغرة.

---

## 🚀 التشغيل المحلي (Getting Started)

### 1. المتطلبات الأساسية
- **Node.js**: v20 أو أحدث.
- **pnpm**: v10 أو أحدث.

### 2. تثبيت الحزم
```bash
pnpm install
```

### 3. متغيرات البيئة (`.env`)
قم بإنشاء ملف `.env` في المسار الرئيسي أو في `artifacts/api-server`:
```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/finalflash
ADMIN_KEY=your_super_secret_admin_key_here
CORS_ALLOWED_ORIGINS=https://finalflash.dz,http://localhost:5173
```

### 4. تشغيل خادم التطوير
```bash
# تشغيل المتجر والواجهة
pnpm --filter @workspace/finalflash-store run dev

# تشغيل خادم الـ API
pnpm --filter @workspace/api-server run dev
```

- المتجر: [http://localhost:5173/](http://localhost:5173/)
- لوحة الإدارة: [http://localhost:5173/admin](http://localhost:5173/admin)

---

## 📦 بناء الإنتاج (Production Build)
```bash
pnpm run build
```

---

© 2026 FINALFLASH. All rights reserved. Rare by choice.
