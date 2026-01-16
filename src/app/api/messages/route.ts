export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getFirestore } from "@/lib/firebaseAdmin";

type ApiItem = {
  id: string;
  text: string;
  senderName: string;
  groupName: string;
  timestampIso: string;
  type?: string;
  raw?: any;
};

function pickBestIso(d: any): string {
  // Prefer newest signal we have, in this order:
  // 1) timestampIso (normalized)
  // 2) createdAtIso (normalized)
  // 3) createdAt Firestore Timestamp
  // 4) createdAt string
  // 5) now
  const tsIso = d?.timestampIso;
  if (tsIso) return String(tsIso);

  const createdAtIso = d?.createdAtIso;
  if (createdAtIso) return String(createdAtIso);

  const createdAt = d?.createdAt;
  // Firestore Timestamp has toDate()
  if (createdAt && typeof createdAt.toDate === "function") {
    return createdAt.toDate().toISOString();
  }

  if (createdAt) return String(createdAt);

  return new Date().toISOString();
}

function docToItem(id: string, d: any): ApiItem | null {
  // Your webhook stores normalized docs like:
  // { id, text, senderName, displayPhoneNumber, timestampIso, type, ... }
  // Old test docs may just be { raw: { hello: "world" } } etc.

  const text =
    d?.text ||
    d?.raw?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body ||
    d?.raw?.hello ||
    null;

  if (!text) return null;

  const senderName =
    d?.senderName ||
    d?.raw?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name ||
    d?.from ||
    "Unknown";

  const groupName =
    d?.displayPhoneNumber ||
    d?.raw?.entry?.[0]?.changes?.[0]?.value?.metadata?.display_phone_number ||
    "WhatsApp";

  const timestampIso = pickBestIso(d);

  return {
    id,
    text: String(text),
    senderName: String(senderName),
    groupName: String(groupName),
    timestampIso,
    type: d?.type ? String(d.type) : undefined,
    raw: d?.raw,
  };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit") || "50"), 200);

    const db = getFirestore();

    // IMPORTANT: we intentionally do a simple read and sort in Node,
    // so docs without createdAt ordering don’t “disappear” from the UI.
    const snap = await db.collection("whatsapp_messages").get();

    const items: ApiItem[] = [];
    snap.forEach((doc) => {
      const item = docToItem(doc.id, doc.data());
      if (item) items.push(item);
    });

    items.sort((a, b) => (a.timestampIso < b.timestampIso ? 1 : -1));

    return NextResponse.json({
      ok: true,
      total: items.length,
      items: items.slice(0, limit),
    });
  } catch (err: any) {
    console.error("/api/messages error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load messages" },
      { status: 500 }
    );
  }
}
