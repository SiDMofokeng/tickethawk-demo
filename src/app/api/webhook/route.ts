// src/app/api/webhook/route.ts
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VERIFY_TOKEN = "tickethawk-xhm8nieu52";

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  // Meta webhook verification handshake
  if (mode === "subscribe" && token === VERIFY_TOKEN && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  // Accept events and respond quickly
  try {
    const body = await req.json();
    console.log("WhatsApp webhook event:", JSON.stringify(body));
  } catch {
    console.log("WhatsApp webhook: non-JSON body or parse error");
  }

  return new Response("OK", { status: 200 });
}
