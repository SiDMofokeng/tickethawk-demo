export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getFirestore } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const db = getFirestore();

    // Firestore aggregate counts (Admin SDK supports count() via aggregation queries)
    const [msgAgg, ticketAgg, kwAgg] = await Promise.all([
      db.collection("whatsapp_messages").count().get(),
      db.collection("tickets").count().get(),
      db.collection("keywords").count().get().catch(() => null), // optional if you don't have this collection yet
    ]);

    const messagesProcessed = msgAgg.data().count || 0;
    const ticketsCreated = ticketAgg.data().count || 0;
    const activeKeywords = kwAgg ? (kwAgg.data().count || 0) : 0;

    return NextResponse.json({
      ok: true,
      messagesProcessed,
      ticketsCreated,
      activeKeywords,
    });
  } catch (e: any) {
    console.error("GET /api/stats error:", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to load stats" },
      { status: 500 }
    );
  }
}
