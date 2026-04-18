import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { PaymentType } from "@/prisma/lib/generated/prisma/enums";

async function getOrgId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true },
  });
  return user?.organizationId ?? null;
}

export async function GET() {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const methods = await prisma.paymentMethod.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(methods);
}

export async function POST(req: NextRequest) {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { type, accountNumber, accountName, isActive, logoUrl } = body;

  if (!type || !accountNumber || !accountName) {
    return NextResponse.json({ error: "type, accountNumber and accountName are required." }, { status: 400 });
  }

  if (!Object.values(PaymentType).includes(type as PaymentType)) {
    return NextResponse.json({ error: "Invalid payment type." }, { status: 400 });
  }

  // Upsert: one record per (orgId, type)
  const existing = await prisma.paymentMethod.findFirst({
    where: { organizationId: orgId, type: type as PaymentType },
  });

  if (existing) {
    const updated = await prisma.paymentMethod.update({
      where: { id: existing.id },
      data: {
        accountNumber,
        accountName,
        isActive: isActive ?? existing.isActive,
        logoUrl: logoUrl ?? existing.logoUrl,
      },
    });
    return NextResponse.json(updated);
  }

  const created = await prisma.paymentMethod.create({
    data: {
      type: type as PaymentType,
      accountNumber,
      accountName,
      isActive: isActive ?? true,
      logoUrl: logoUrl ?? null,
      organizationId: orgId,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
