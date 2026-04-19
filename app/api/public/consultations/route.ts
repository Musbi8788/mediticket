import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ChatMsg = { role: "user" | "assistant"; content: string };

const SUMMARY_PROMPT = `Based on the following pre-consultation chat between a patient and an AI assistant, produce a structured clinical summary for the attending doctor.

Return your response in this exact format:
SEVERITY: CRITICAL|MODERATE|MILD
SUMMARY: <2-3 sentence summary of the patient's condition and main complaints>
RECOMMENDATION: <1-2 sentence clinical recommendation for the doctor>
SYMPTOMS: <comma-separated list of key symptoms mentioned>

Rules:
- SEVERITY is CRITICAL for chest pain, difficulty breathing, severe bleeding, stroke symptoms, or acute abdominal pain
- SEVERITY is MODERATE for persistent fever, uncontrolled chronic conditions, moderate pain
- SEVERITY is MILD for minor infections, mild pain, routine check-ups
- Never diagnose — only summarise and suggest
- Write clearly for a clinical audience`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { patientName, patientAge, symptoms, chatHistory, organizationId } = body;

  if (!patientName || !patientAge || !organizationId || !Array.isArray(chatHistory)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const org = await prisma.organization.findUnique({ where: { id: organizationId }, select: { id: true } });
  if (!org) return NextResponse.json({ error: "Hospital not found" }, { status: 404 });

  const apiKey = process.env.OPEN_ROUTER_API_KEY;
  let aiSummary = "";
  let aiRecommendation = "";
  let severity: "CRITICAL" | "MODERATE" | "MILD" = "MILD";

  if (apiKey) {
    try {
      const transcript = (chatHistory as ChatMsg[])
        .map((m) => `${m.role === "user" ? patientName : "AI"}: ${m.content}`)
        .join("\n");

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
          "X-Title": "MediTicket Triage Summary",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            { role: "system", content: SUMMARY_PROMPT },
            { role: "user", content: `Patient: ${patientName}, Age: ${patientAge}\n\nChat transcript:\n${transcript}` },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text: string = data.choices?.[0]?.message?.content ?? "";

        const sevMatch = text.match(/SEVERITY:\s*(CRITICAL|MODERATE|MILD)/i);
        const sumMatch = text.match(/SUMMARY:\s*(.+?)(?=\nRECOMMENDATION:|$)/is);
        const recMatch = text.match(/RECOMMENDATION:\s*(.+?)(?=\nSYMPTOMS:|$)/is);

        if (sevMatch) severity = sevMatch[1].toUpperCase() as "CRITICAL" | "MODERATE" | "MILD";
        if (sumMatch) aiSummary = sumMatch[1].trim();
        if (recMatch) aiRecommendation = recMatch[1].trim();
      }
    } catch {
      // fall through — save without AI summary
    }
  }

  const consultation = await prisma.consultation.create({
    data: {
      patientName,
      patientAge: Number(patientAge),
      symptoms: symptoms || "",
      chatHistory,
      aiSummary: aiSummary || null,
      aiRecommendation: aiRecommendation || null,
      severity,
      status: "PENDING",
      organizationId,
    },
  });

  return NextResponse.json({ consultation: { id: consultation.id, severity, status: "PENDING" } }, { status: 201 });
}
