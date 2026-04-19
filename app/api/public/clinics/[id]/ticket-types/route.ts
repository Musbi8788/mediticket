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

  const ticketTypes = await prisma.ticketType.findMany({
    where: { organizationId: id },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
    },
  });

  return NextResponse.json(
    ticketTypes.map((t) => ({ ...t, price: Number(t.price) }))
  );
}
