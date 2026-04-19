import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export { OPTIONS } from "../../../cors";

const MODEMPAY_API_URL =
  process.env.MODEMPAY_ENV === "live"
    ? "https://api.modempay.com/v1/payments"
    : "https://sandbox.api.modempay.com/v1/payments";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: organizationId } = await params;

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, name: true },
  });
  if (!org) return NextResponse.json({ error: "Clinic not found" }, { status: 404 });

  const body = await req.json();
  const { buyerName, buyerPhone, buyerEmail, paymentPhone, ticketTypeId, paymentMethodId } = body;

  if (!buyerName || !buyerPhone || !paymentPhone || !ticketTypeId || !paymentMethodId) {
    return NextResponse.json(
      { error: "buyerName, buyerPhone, paymentPhone, ticketTypeId, and paymentMethodId are required" },
      { status: 400 }
    );
  }
  // buyerPhone = WhatsApp number, paymentPhone = mobile money number

  const ticketType = await prisma.ticketType.findFirst({
    where: { id: ticketTypeId, organizationId },
  });
  if (!ticketType) {
    return NextResponse.json({ error: "Ticket type not found for this clinic" }, { status: 404 });
  }

  const paymentMethod = await prisma.paymentMethod.findFirst({
    where: { id: paymentMethodId, organizationId, isActive: true },
  });
  if (!paymentMethod) {
    return NextResponse.json({ error: "Payment method not found or inactive" }, { status: 404 });
  }

  // buyerPhone = WhatsApp number (session identity)
  // paymentPhone = number the user wants to receive the ticket SMS on
  const purchase = await prisma.ticketPurchase.create({
    data: {
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone.trim(),     // WhatsApp number
      whatsappPhone: paymentPhone.trim(), // SMS notification number
      buyerEmail: buyerEmail?.trim() ?? null,
      amount: ticketType.price,
      status: "PENDING",
      ticketTypeId,
      paymentMethodId,
      organizationId,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const apiKey = process.env.MODEMPAY_API_KEY;
  const isLiveUrl = appUrl.startsWith("https://");

  if (!apiKey) {
    return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 });
  }

  // Create payment intent with Modem Pay
  let paymentLink: string;
  let intentSecret: string;

  try {
    const modemRes = await fetch(MODEMPAY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        data: {
          amount: Number(ticketType.price),
          currency: "GMD",
          customer_name: buyerName.trim(),
          customer_email: buyerEmail?.trim() ?? undefined,
          customer_phone: paymentPhone.trim(), // SMS number passed for Modem Pay records
          title: ticketType.name,
          description: `${ticketType.name} — ${org.name}`,
          // Only send URLs when we have a real public HTTPS domain
          ...(isLiveUrl && {
            return_url: `${appUrl}/payment/success`,
            cancel_url: `${appUrl}/payment/cancelled`,
            callback_url: `${appUrl}/api/webhooks/modempay`,
          }),
          metadata: {
            purchase_id: purchase.id,
            organization_id: organizationId,
            ticket_type_id: ticketTypeId,
          },
          from_sdk: false,
          skip_url_validation: !isLiveUrl,
        },
      }),
    });

    const modemData = await modemRes.json();

    if (!modemRes.ok || !modemData.status) {
      // Mark purchase as failed so the record isn't left orphaned
      await prisma.ticketPurchase.update({
        where: { id: purchase.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json(
        { error: modemData.message ?? "Failed to create payment link" },
        { status: 502 }
      );
    }

    paymentLink = modemData.data.payment_link;
    intentSecret = modemData.data.intent_secret;
  } catch {
    await prisma.ticketPurchase.update({
      where: { id: purchase.id },
      data: { status: "FAILED" },
    });
    return NextResponse.json({ error: "Payment gateway unreachable" }, { status: 502 });
  }

  // Store the intent secret as the transaction reference
  await prisma.ticketPurchase.update({
    where: { id: purchase.id },
    data: { transactionRef: intentSecret },
  });

  return NextResponse.json(
    {
      id: purchase.id,
      buyerName: purchase.buyerName,
      buyerPhone: purchase.buyerPhone,
      amount: Number(ticketType.price),
      status: "PENDING",
      paymentLink,
      ticketType: { name: ticketType.name, price: Number(ticketType.price) },
      paymentMethod: { type: paymentMethod.type },
      purchasedAt: purchase.purchasedAt.toISOString(),
    },
    { status: 201 }
  );
}
