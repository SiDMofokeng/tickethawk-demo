export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

const VERIFY_TOKEN = "tickethawk-xhm8nieu52";

// --- Types we persist ---
type NormalizedMessage = {
  id: string;
  platform: "whatsapp";
  from?: string;
  senderName?: string;
  text: string;
  type?: string;
  timestampIso: string;
  phoneNumberId?: string;
  displayPhoneNumber?: string;
  waBusinessAccountId?: string;
  raw?: any;
  createdAtIso: string;
};

type TicketDoc = {
  id: string;                 // e.g. TKT-XXXX
  messageId: string;          // wamid...
  status: "new" | "in_progress" | "closed";
  keyword: string;
  groupName: string;          // display phone number
  senderName: string;
  from: string;
  text: string;
  timestampIso: string;

  assignedAdminId?: string;
  assignedAdminName?: string;

  createdAtIso: string;
  createdAt: any;
};

function safeString(v: any, fallback = ""): string {
  if (v === undefined || v === null) return fallback;
  return String(v);
}

function isoFromUnixSeconds(sec?: string | number): string | null {
  if (sec === undefined || sec === null) return null;
  const n = typeof sec === "string" ? Number(sec) : sec;
  if (!Number.isFinite(n)) return null;
  return new Date(n * 1000).toISOString();
}

/**
 * Extract 0..N WhatsApp messages from a Meta webhook payload.
 * Handles: entry[].changes[].value.messages[]
 */
function extractWhatsAppMessages(payload: any): NormalizedMessage[] {
  const out: NormalizedMessage[] = [];
  const entries = Array.isArray(payload?.entry) ? payload.entry : [];
  if (entries.length === 0) return out;

  for (const entry of entries) {
    const changes = Array.isArray(entry?.changes) ? entry.changes : [];
    for (const change of changes) {
      const value = change?.value || {};

      // WhatsApp metadata
      const meta = value?.metadata || {};
      const displayPhoneNumber = safeString(meta?.display_phone_number, "");
      const phoneNumberId = safeString(meta?.phone_number_id, "");

      const contacts = Array.isArray(value?.contacts) ? value.contacts : [];
      const senderName =
        contacts?.[0]?.profile?.name ||
        contacts?.[0]?.wa_id ||
        undefined;

      const messages = Array.isArray(value?.messages) ? value.messages : [];
      if (messages.length === 0) continue;

      for (let i = 0; i < messages.length; i++) {
        const m = messages[i] || {};
        const msgId = safeString(m?.id, `docmsg_${i}`);
        const from = safeString(m?.from, "");
        const type = safeString(m?.type, "message");

        const text =
          m?.text?.body ||
          m?.button?.text ||
          m?.interactive?.button_reply?.title ||
          m?.interactive?.list_reply?.title ||
          `[${type}]`;

        const timestampIso =
          isoFromUnixSeconds(m?.timestamp) ||
          new Date().toISOString();

        out.push({
          id: msgId,
          platform: "whatsapp",
          from,
          senderName,
          text: safeString(text, "[message]"),
          type,
          timestampIso,
          phoneNumberId: phoneNumberId || undefined,
          displayPhoneNumber: displayPhoneNumber || undefined,
          waBusinessAccountId: safeString(entry?.id, "") || undefined,
          raw: payload,
          createdAtIso: new Date().toISOString(),
        });
      }
    }
  }

  return out;
}

// ---------------------------
// Keyword detection + ticket creation (SERVER SIDE)
// ---------------------------

// If you already manage keywords/admins in Firestore later, replace these fallbacks.
// For now, this makes tickets REAL immediately, matching your current demo keywords.
const FALLBACK_KEYWORDS: Array<{ term: string; assignedAdminName: string; assignedAdminId: string }> = [
  { term: "broken",  assignedAdminName: "Dev Team",        assignedAdminId: "admin_dev" },
  { term: "login",   assignedAdminName: "Dev Team",        assignedAdminId: "admin_dev" },
  { term: "refund",  assignedAdminName: "Support Team",    assignedAdminId: "admin_support" },
  { term: "payment", assignedAdminName: "Billing Team",    assignedAdminId: "admin_billing" },
  { term: "feedback",assignedAdminName: "Maria Garcia",    assignedAdminId: "admin_maria" },
];

// make a stable ticket id from message id (short + readable)
function makeTicketId(messageId: string) {
  const tail = messageId.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase();
  return `TKT-${tail || Math.random().toString(16).slice(2, 8).toUpperCase()}`;
}

function detectKeyword(text: string): { term: string; assignedAdminName: string; assignedAdminId: string } | null {
  const words = safeString(text, "")
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[.,!?]/g, ""))
    .filter(Boolean);

  for (const w of words) {
    const hit = FALLBACK_KEYWORDS.find((k) => k.term.toLowerCase() === w);
    if (hit) return hit;
  }
  return null;
}

// WhatsApp Webhook Verification Endpoint (GET)
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const mode = sp.get("hub.mode");
  const token = sp.get("hub.verify_token");
  const challenge = sp.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

// Incoming WhatsApp Events Endpoint (POST)
export async function POST(req: NextRequest) {
  const db = getFirestore();

  try {
    const body = await req.json();

    // 1) Always store raw event (debug/audit)
    await db.collection("whatsapp_events").add({
      createdAt: FieldValue.serverTimestamp(),
      receivedAtIso: new Date().toISOString(),
      raw: body,
    });

    // 2) Normalize WhatsApp messages into whatsapp_messages
    const normalized = extractWhatsAppMessages(body);

    if (normalized.length > 0) {
      for (const msg of normalized) {
        // Upsert message
        await db.collection("whatsapp_messages").doc(msg.id).set(
          {
            ...msg,
            createdAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        // 3) Detect keyword and create REAL ticket (idempotent per message)
        const hit = detectKeyword(msg.text);
        if (hit) {
          const ticketDocId = msg.id; // idempotent key
          const ticket: TicketDoc = {
            id: makeTicketId(msg.id),
            messageId: msg.id,
            status: "new",
            keyword: hit.term,
            groupName: msg.displayPhoneNumber || "WhatsApp",
            senderName: msg.senderName || msg.from || "Unknown",
            from: msg.from || "",
            text: msg.text,
            timestampIso: msg.timestampIso,

            assignedAdminId: hit.assignedAdminId,
            assignedAdminName: hit.assignedAdminName,

            createdAtIso: new Date().toISOString(),
            createdAt: FieldValue.serverTimestamp(),
          };

          await db.collection("tickets").doc(ticketDocId).set(ticket, { merge: true });
        }
      }

      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    }

    // 4) Non-message event: still store a generic record so you can see activity if needed
    const genericId = `generic_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    await db.collection("whatsapp_messages").doc(genericId).set(
      {
        id: genericId,
        platform: "whatsapp",
        text: "[non-message event received]",
        type: "event",
        timestampIso: new Date().toISOString(),
        createdAtIso: new Date().toISOString(),
        raw: body,
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return new NextResponse("EVENT_RECEIVED", { status: 200 });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return new NextResponse("INTERNAL_SERVER_ERROR", { status: 500 });
  }
}
