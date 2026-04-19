import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true },
  });
  if (!user?.organizationId) return NextResponse.json({ error: "No organization" }, { status: 404 });

  const consultations = await prisma.consultation.findMany({
    where: { organizationId: user.organizationId },
    orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      patientName: true,
      patientAge: true,
      symptoms: true,
      chatHistory: true,
      aiSummary: true,
      aiRecommendation: true,
      severity: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ consultations });
}
