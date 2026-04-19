import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}

async function sendTicketSMS(purchase: {
  id: string;
  buyerName: string;
  whatsappPhone: string | null;
  amount: unknown;
  ticketType: { name: string };
  organization: { name: string };
}) {
  const rawPhone = purchase.whatsappPhone;
  if (!rawPhone) return;

  const username = process.env.CLICKSEND_USERNAME;
  const apiKey   = process.env.CLICKSEND_API_KEY;
  if (!username || !apiKey) return;

  // ClickSend requires E.164 format with + prefix
  const to = rawPhone.startsWith("+") ? rawPhone : `+${rawPhone}`;
  const ticketRef = purchase.id.slice(-8).toUpperCase();

  const body =
    `MediTicket - Payment Confirmed!\n` +
    `Ticket ID: ${ticketRef}\n` +
    `Full Ref: ${purchase.id}\n` +
    `Clinic: ${purchase.organization.name}\n` +
    `Service: ${purchase.ticketType.name}\n` +
    `Amount: GMD ${Number(purchase.amount).toFixed(2)}\n` +
    `Show this at reception.`;

  const credentials = Buffer.from(`${username}:${apiKey}`).toString("base64");

  await fetch("https://rest.clicksend.com/v3/sms/send", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [{ source: "mediticket", to, body }],
    }),
  });
}

async function completeAndNotify(purchaseId: string) {
  const purchase = await prisma.ticketPurchase.update({
    where: { id: purchaseId },
    data: { status: "COMPLETED" },
    include: {
      ticketType: { select: { name: true } },
      organization: { select: { name: true } },
    },
  });
  await sendTicketSMS(purchase);
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.MODEMPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-modem-signature") ?? "";

  if (!verifySignature(rawBody, signature, webhookSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { event, payload } = JSON.parse(rawBody);

  // Payment completed via charge event — look up by metadata.purchase_id
  if (event === "charge.succeeded") {
    const purchaseId = payload?.metadata?.purchase_id as string | undefined;
    if (purchaseId) await completeAndNotify(purchaseId);
    return NextResponse.json({ received: true });
  }

  // New Modem Pay customer created after payment — look up by mobile money phone
  if (event === "customer.created") {
    const phone = payload?.phone as string | undefined;
    if (phone) {
      const purchase = await prisma.ticketPurchase.findFirst({
        where: { buyerPhone: phone, status: "PENDING" },
        orderBy: { purchasedAt: "desc" },
      });
      if (purchase) await completeAndNotify(purchase.id);
    }
    return NextResponse.json({ received: true });
  }

  // Payment failed / cancelled / expired
  if (["charge.failed", "charge.cancelled", "charge.expired"].includes(event)) {
    const purchaseId = payload?.metadata?.purchase_id as string | undefined;
    if (purchaseId) {
      await prisma.ticketPurchase.update({
        where: { id: purchaseId },
        data: { status: "FAILED" },
      });
    }
    return NextResponse.json({ received: true });
  }

  // Refund
  if (event === "charge.refunded") {
    const purchaseId = payload?.metadata?.purchase_id as string | undefined;
    if (purchaseId) {
      await prisma.ticketPurchase.update({
        where: { id: purchaseId },
        data: { status: "REFUNDED" },
      });
    }
    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true });
}
