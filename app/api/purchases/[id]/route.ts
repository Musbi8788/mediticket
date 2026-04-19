import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true },
  });
  if (!user?.organizationId) return NextResponse.json({ error: "No organization" }, { status: 404 });

  const { id } = await params;
  const { action } = await req.json();

  if (action !== "mark_used") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const purchase = await prisma.ticketPurchase.findFirst({
    where: { id, organizationId: user.organizationId },
  });

  if (!purchase) return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  if (purchase.status !== "COMPLETED") {
    return NextResponse.json({ error: "Only completed tickets can be marked as used" }, { status: 400 });
  }

  const updated = await prisma.ticketPurchase.update({
    where: { id },
    data: { status: "USED" },
  });

  return NextResponse.json({ id: updated.id, status: updated.status });
}
