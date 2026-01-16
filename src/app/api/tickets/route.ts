export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getFirestore } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const db = getFirestore();

    const snap = await db
      .collection("tickets")
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();

    const items = snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        docId: d.id, // messageId (idempotent key)
        id: data.id, // TKT-XXXX
        status: data.status,
        keyword: data.keyword,
        groupName: data.groupName,
        senderName: data.senderName,
        assignedAdminName: data.assignedAdminName,
        text: data.text,
        timestampIso: data.timestampIso,
        createdAtIso: data.createdAtIso,
      };
    });

    return NextResponse.json({ ok: true, items });
  } catch (e: any) {
    console.error("GET /api/tickets error:", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to load tickets" },
      { status: 500 }
    );
  }
}
