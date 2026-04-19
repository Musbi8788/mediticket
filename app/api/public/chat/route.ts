import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are MediTicket AI, a friendly medical pre-consultation assistant for hospitals in The Gambia.

Your role:
- Greet the patient warmly and ask about their symptoms
- Ask short follow-up questions to understand their condition better (duration, severity, location)
- After 3-4 exchanges, suggest which type of medical service or department may be relevant
- Offer to generate a brief, clear summary of their symptoms for the doctor

Strict rules:
- NEVER diagnose any condition
- NEVER recommend specific medications or treatments
- Always remind the patient that the doctor makes all medical decisions — you only help organise their information
- Keep each response to 2-3 sentences maximum
- Be empathetic, calm, and reassuring
- Write in plain English suitable for all literacy levels`;

export async function POST(req: NextRequest) {
  const { messages, patientName, patientAge } = await req.json();

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Messages are required" }, { status: 400 });
  }

  const patientContext = patientName
    ? `\n\nPatient context: Name is ${patientName}${patientAge ? `, age ${patientAge}` : ""}. Address them by name.`
    : "";

  const apiKey = process.env.OPEN_ROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "MediTicket AI Assistant",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "system", content: SYSTEM_PROMPT + patientContext }, ...messages],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("OpenRouter error:", err);
    return NextResponse.json({ error: "AI service error" }, { status: 502 });
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content ?? "";

  return NextResponse.json({ reply });
}
