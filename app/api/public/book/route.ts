import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { buyerName, buyerPhone, buyerEmail, ticketTypeId, paymentMethodId, aiSummary } = body;

  if (!buyerName || !buyerPhone || !ticketTypeId) {
    return NextResponse.json({ error: "Name, phone, and ticket type are required" }, { status: 400 });
  }

  const ticketType = await prisma.ticketType.findUnique({
    where: { id: ticketTypeId },
    select: { price: true, organizationId: true },
  });
  if (!ticketType) {
    return NextResponse.json({ error: "Ticket type not found" }, { status: 404 });
  }

  const purchase = await prisma.ticketPurchase.create({
    data: {
      buyerName,
      buyerPhone,
      buyerEmail: buyerEmail || null,
      amount: ticketType.price,
      status: "PENDING",
      source: "ONLINE",
      ticketTypeId,
      paymentMethodId: paymentMethodId || null,
      organizationId: ticketType.organizationId,
      aiSummary: aiSummary || null,
      notes: aiSummary ? `AI Pre-Consultation Summary:\n${aiSummary}` : null,
    },
    select: { id: true, buyerName: true, amount: true, status: true, purchasedAt: true },
  });

  return NextResponse.json({ booking: { ...purchase, amount: Number(purchase.amount) } }, { status: 201 });
}
