import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export { OPTIONS } from "../cors";

export async function GET() {
  const clinics = await prisma.organization.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      logo: true,
    },
  });

  return NextResponse.json(clinics);
}
