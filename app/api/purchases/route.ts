import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true },
  });
  if (!user?.organizationId) return NextResponse.json({ error: "No organization" }, { status: 404 });

  const orgId = user.organizationId;
  const { searchParams } = new URL(req.url);

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10")));
  const dateRange = searchParams.get("dateRange") ?? "30d";
  const status = searchParams.get("status") ?? "";
  const search = searchParams.get("search") ?? "";

  const now = new Date();
  let dateFrom: Date | undefined;
  if (dateRange === "7d") dateFrom = new Date(now.getTime() - 7 * 86400000);
  else if (dateRange === "30d") dateFrom = new Date(now.getTime() - 30 * 86400000);
  else if (dateRange === "90d") dateFrom = new Date(now.getTime() - 90 * 86400000);

  const where = {
    organizationId: orgId,
    ...(dateFrom ? { purchasedAt: { gte: dateFrom } } : {}),
    ...(status ? { status: status as "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" } : {}),
    ...(search
      ? {
          OR: [
            { buyerName: { contains: search, mode: "insensitive" as const } },
            { transactionRef: { contains: search, mode: "insensitive" as const } },
            { ticketType: { name: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [total, purchases, aggregate, pendingCount] = await Promise.all([
    prisma.ticketPurchase.count({ where }),
    prisma.ticketPurchase.findMany({
      where,
      orderBy: { purchasedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        ticketType: { select: { name: true } },
        paymentMethod: { select: { type: true } },
      },
    }),
    prisma.ticketPurchase.aggregate({
      where: { organizationId: orgId, status: "COMPLETED", ...(dateFrom ? { purchasedAt: { gte: dateFrom } } : {}) },
      _sum: { amount: true },
      _count: true,
      _avg: { amount: true },
    }),
    prisma.ticketPurchase.count({ where: { organizationId: orgId, status: "PENDING" } }),
  ]);

  return NextResponse.json({
    purchases: purchases.map((p) => ({
      id: p.id,
      buyerName: p.buyerName,
      buyerPhone: p.buyerPhone,
      buyerEmail: p.buyerEmail,
      amount: Number(p.amount),
      status: p.status,
      transactionRef: p.transactionRef,
      ticketType: p.ticketType.name,
      paymentMethod: p.paymentMethod.type,
      purchasedAt: p.purchasedAt.toISOString(),
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    stats: {
      totalIncome: Number(aggregate._sum.amount ?? 0),
      ticketsIssued: aggregate._count,
      pendingCount,
      avgTicketValue: Number(aggregate._avg.amount ?? 0),
    },
  });
}
