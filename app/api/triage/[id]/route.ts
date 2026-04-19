import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true },
  });
  if (!user?.organizationId) return NextResponse.json({ error: "No organization" }, { status: 404 });

  const { id } = await params;
  const { status } = await req.json();

  const validStatuses = ["PENDING", "IN_REVIEW", "APPROVED", "REFERRED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const consultation = await prisma.consultation.findFirst({
    where: { id, organizationId: user.organizationId },
  });
  if (!consultation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.consultation.update({
    where: { id },
    data: { status },
    select: { id: true, status: true },
  });

  return NextResponse.json({ consultation: updated });
}
