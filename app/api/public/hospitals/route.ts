import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const organizations = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
      address: true,
      phone: true,
      ticketTypes: {
        select: { id: true, name: true, description: true, price: true },
        orderBy: { name: "asc" },
      },
      paymentMethods: {
        where: { isActive: true },
        select: { id: true, type: true, accountNumber: true, accountName: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    hospitals: organizations.map((org) => ({
      ...org,
      ticketTypes: org.ticketTypes.map((t) => ({ ...t, price: Number(t.price) })),
    })),
  });
}
