import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export { OPTIONS } from "../../../cors";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const org = await prisma.organization.findUnique({ where: { id }, select: { id: true } });
  if (!org) return NextResponse.json({ error: "Clinic not found" }, { status: 404 });

  const methods = await prisma.paymentMethod.findMany({
    where: { organizationId: id, isActive: true },
    orderBy: { type: "asc" },
    select: {
      id: true,
      type: true,
      accountNumber: true,
      accountName: true,
    },
  });

  return NextResponse.json(methods);
}
