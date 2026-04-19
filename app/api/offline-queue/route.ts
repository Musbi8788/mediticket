import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getOrgId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true },
  });
  return user?.organizationId ?? null;
}

export async function GET(req: NextRequest) {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const baseWhere = { organizationId: orgId, source: "WALKIN" as const };

  const where = {
    ...baseWhere,
    ...(status ? { status: status as "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" } : {}),
    ...(search
      ? {
          OR: [
            { buyerName: { contains: search, mode: "insensitive" as const } },
            { buyerPhone: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [queue, todayCompleted, todayAll] = await Promise.all([
    prisma.ticketPurchase.findMany({
      where,
      orderBy: { purchasedAt: "desc" },
      take: 100,
      include: {
        ticketType: { select: { name: true, price: true } },
      },
    }),
    prisma.ticketPurchase.aggregate({
      where: { ...baseWhere, status: "COMPLETED", purchasedAt: { gte: today } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.ticketPurchase.findMany({
      where: { ...baseWhere, purchasedAt: { gte: today } },
      select: { status: true },
    }),
  ]);

  const issuedToday = todayAll.filter((p) => p.status !== "FAILED").length;
  const cancelledToday = todayAll.filter((p) => p.status === "FAILED").length;

  return NextResponse.json({
    queue: queue.map((p) => ({
      id: p.id,
      buyerName: p.buyerName,
      buyerPhone: p.buyerPhone,
      amount: Number(p.amount),
      status: p.status,
      notes: p.notes,
      ticketType: p.ticketType.name,
      purchasedAt: p.purchasedAt.toISOString(),
    })),
    stats: {
      totalRevenue: Number(todayCompleted._sum.amount ?? 0),
      issuedToday,
      cancelledToday,
      pendingCount: todayAll.filter((p) => p.status === "PENDING").length,
    },
  });
}

export async function POST(req: NextRequest) {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { buyerName, buyerPhone, ticketTypeId, notes } = body;

  if (!buyerName?.trim()) return NextResponse.json({ error: "Patient name is required." }, { status: 400 });
  if (!buyerPhone?.trim()) return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
  if (!ticketTypeId) return NextResponse.json({ error: "Ticket type is required." }, { status: 400 });

  const ticketType = await prisma.ticketType.findFirst({
    where: { id: ticketTypeId, organizationId: orgId },
  });
  if (!ticketType) return NextResponse.json({ error: "Invalid ticket type." }, { status: 400 });

  const purchase = await prisma.ticketPurchase.create({
    data: {
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone.trim(),
      amount: ticketType.price,
      status: "PENDING",
      source: "WALKIN",
      notes: notes?.trim() || null,
      ticketType: { connect: { id: ticketTypeId } },
      organization: { connect: { id: orgId } },
    },
    include: { ticketType: { select: { name: true } } },
  });

  return NextResponse.json({
    id: purchase.id,
    buyerName: purchase.buyerName,
    buyerPhone: purchase.buyerPhone,
    amount: Number(purchase.amount),
    status: purchase.status,
    notes: purchase.notes,
    ticketType: purchase.ticketType.name,
    purchasedAt: purchase.purchasedAt.toISOString(),
  });
}

export async function PATCH(req: NextRequest) {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, status } = body;

  if (!id || !status) return NextResponse.json({ error: "id and status are required." }, { status: 400 });

  const allowed = ["PENDING", "COMPLETED", "FAILED"];
  if (!allowed.includes(status)) return NextResponse.json({ error: "Invalid status." }, { status: 400 });

  const updated = await prisma.ticketPurchase.updateMany({
    where: { id, organizationId: orgId },
    data: { status },
  });

  if (updated.count === 0) return NextResponse.json({ error: "Record not found." }, { status: 404 });

  return NextResponse.json({ ok: true });
}
