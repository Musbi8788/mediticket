import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TRANSFER_URL =
  process.env.MODEMPAY_ENV === "live"
    ? "https://api.modempay.com/v1/transfers"
    : "https://sandbox.api.modempay.com/v1/transfers";

const NETWORK_MAP: Record<string, string> = {
  WAVE: "wave",
  QMONEY: "qmoney",
  APS: "aps",
  AFRIMONEY: "afrimoney",
  YONNA: "yonna",
};

export async function GET(req: NextRequest) {
  // Vercel passes CRON_SECRET in the Authorization header
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.MODEMPAY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Modem Pay not configured" }, { status: 500 });
  }

  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

  // Find all completed purchases older than 12 hours with no payout yet
  const purchases = await prisma.ticketPurchase.findMany({
    where: {
      status: "COMPLETED",
      payoutSentAt: null,
      updatedAt: { lte: twelveHoursAgo },
    },
    include: {
      paymentMethod: { select: { type: true, accountNumber: true, accountName: true } },
      organization: { select: { name: true } },
      ticketType: { select: { name: true } },
    },
  });

  const results = { sent: 0, failed: 0, errors: [] as string[] };

  for (const purchase of purchases) {
    const network = NETWORK_MAP[purchase.paymentMethod.type];
    if (!network) {
      results.failed++;
      results.errors.push(`${purchase.id}: unknown network ${purchase.paymentMethod.type}`);
      continue;
    }

    try {
      const res = await fetch(TRANSFER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "Idempotency-Key": purchase.id, // prevents double-payout if cron runs twice
        },
        body: JSON.stringify({
          amount: Number(purchase.amount),
          currency: "GMD",
          recipient_phone: purchase.paymentMethod.accountNumber,
          beneficiary_name: purchase.paymentMethod.accountName,
          network,
          transfer_note: `Ticket payout — ${purchase.ticketType.name} — ${purchase.organization.name}`,
          metadata: { purchase_id: purchase.id },
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.status) {
        results.failed++;
        results.errors.push(`${purchase.id}: ${data.message ?? res.status}`);
        continue;
      }

      await prisma.ticketPurchase.update({
        where: { id: purchase.id },
        data: { payoutSentAt: new Date() },
      });

      results.sent++;
    } catch (err) {
      results.failed++;
      results.errors.push(`${purchase.id}: ${(err as Error).message}`);
    }
  }

  console.log(`[CRON] Payouts — sent: ${results.sent}, failed: ${results.failed}`);
  return NextResponse.json({ ...results, total: purchases.length });
}
