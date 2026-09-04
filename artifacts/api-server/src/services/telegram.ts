/**
 * Telegram Bot Order Notification Service
 * Sends instant notifications to the store owner's Telegram chat or channel
 * whenever a new order is confirmed in the database.
 */

export interface TelegramOrderNotificationPayload {
  orderNumber: string;
  customerName: string;
  phone: string;
  wilaya: string;
  commune: string;
  deliveryMethod: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  items: Array<{
    productTitle: string;
    size: string;
    color?: string | null;
    quantity: number;
    unitPrice: number;
  }>;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function formatTelegramOrderMessage(order: TelegramOrderNotificationPayload): string {
  const itemsText = order.items
    .map(
      (item) =>
        `• <b>${escapeHtml(item.productTitle)}</b> (${escapeHtml(item.size)}${item.color ? ` / ${escapeHtml(item.color)}` : ""}) x${item.quantity} — <code>${item.unitPrice * item.quantity} DA</code>`
    )
    .join("\n");

  const cleanPhone = order.phone.replace(/\D/g, "");
  const waPhone = cleanPhone.startsWith("0") ? `213${cleanPhone.slice(1)}` : cleanPhone;
  const deliveryDesc =
    order.deliveryMethod === "home" ? "توصيل للباب (À domicile)" : "استلام من المكتب (Stop desk)";

  return `⚡ <b>طلب جديد في متجر Finalflash!</b>

📦 <b>رقم الطلب:</b> <code>${escapeHtml(order.orderNumber)}</code>
👤 <b>الزبون:</b> ${escapeHtml(order.customerName)}
📞 <b>الهاتف:</b> <code>${escapeHtml(order.phone)}</code>
📍 <b>العنوان:</b> ${escapeHtml(order.wilaya)} — ${escapeHtml(order.commune)}
🚚 <b>طريقة التوصيل:</b> ${deliveryDesc}

🛍️ <b>القطع المطلوبة:</b>
${itemsText}

💵 <b>المجموع الفرعي:</b> ${order.subtotal} DA
🚚 <b>سعر التوصيل:</b> ${order.deliveryFee} DA
💰 <b>المبلغ الإجمالي:</b> <b>${order.total} DA</b>

👉 <a href="https://wa.me/${waPhone}">مراسلة الزبون على واتساب مباشرة</a>`;
}

export async function sendTelegramOrderNotification(
  order: TelegramOrderNotificationPayload,
  logger?: { info?: (msg: string) => void; warn?: (msg: string) => void; error?: (obj: any, msg?: string) => void }
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    logger?.info?.("Telegram notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured");
    return false;
  }

  const message = formatTelegramOrderMessage(order);
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      logger?.error?.({ status: res.status, body: errText }, "Failed to send Telegram notification");
      return false;
    }

    logger?.info?.(`Telegram notification sent successfully for order ${order.orderNumber}`);
    return true;
  } catch (err) {
    logger?.error?.({ err }, "Error sending Telegram notification");
    return false;
  }
}
