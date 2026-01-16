"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/context/app-context";

type ApiMessageDoc = {
  id: string;
  createdAt?: string;
  raw?: any;
};

type UiMessage = {
  id: string;
  senderName: string;
  groupName: string;
  text: string;
  timestamp: string;
};

function toIsoFromUnixSeconds(sec?: string | number): string | null {
  if (sec === undefined || sec === null) return null;
  const n = typeof sec === "string" ? Number(sec) : sec;
  if (!Number.isFinite(n)) return null;
  return new Date(n * 1000).toISOString();
}

function extractMessagesFromDoc(doc: ApiMessageDoc): UiMessage[] {
  const raw = doc?.raw;
  if (!raw) return [];

  const entries = Array.isArray(raw.entry) ? raw.entry : [];
  if (entries.length === 0) return [];

  const out: UiMessage[] = [];

  for (const entry of entries) {
    const changes = Array.isArray(entry?.changes) ? entry.changes : [];
    for (const change of changes) {
      const value = change?.value;
      const messages = Array.isArray(value?.messages) ? value.messages : [];
      if (messages.length === 0) continue;

      const contacts = Array.isArray(value?.contacts) ? value.contacts : [];
      const contactName =
        contacts?.[0]?.profile?.name || contacts?.[0]?.wa_id || undefined;

      const businessNumber =
        value?.metadata?.display_phone_number ||
        value?.metadata?.phone_number_id ||
        "WhatsApp";

      for (let i = 0; i < messages.length; i++) {
        const m = messages[i];
        const text =
          m?.text?.body ||
          m?.button?.text ||
          m?.interactive?.button_reply?.title ||
          m?.interactive?.list_reply?.title ||
          `[${m?.type || "message"}]`;

        const tsIso =
          toIsoFromUnixSeconds(m?.timestamp) ||
          doc.createdAt ||
          new Date().toISOString();

        out.push({
          id: `${doc.id}:${m?.id || i}`,
          senderName: contactName || m?.from || "Unknown",
          groupName: String(businessNumber),
          text: String(text),
          timestamp: tsIso,
        });
      }
    }
  }

  return out;
}

function firstKeywordInText(text: string, keywordTermsLower: Set<string>) {
  const words = text.toLowerCase().split(/\s+/);
  for (const w of words) {
    const clean = w.replace(/[.,!?]/g, "");
    if (keywordTermsLower.has(clean)) return clean;
  }
  return null;
}

export function OverviewStats() {
  const { keywords } = useAppContext();

  const keywordTermsLower = useMemo(() => {
    return new Set((keywords || []).map((k) => k.term.toLowerCase()));
  }, [keywords]);

  const [messagesCount, setMessagesCount] = useState(0);
  const [ticketsCount, setTicketsCount] = useState(0);
  const [activeKeywordsCount, setActiveKeywordsCount] = useState(
    keywords?.length || 0
  );

  async function load() {
    try {
      const res = await fetch("/api/messages", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data?.ok) return;

      const docs: ApiMessageDoc[] = Array.isArray(data.items) ? data.items : [];
      const msgs = docs.flatMap(extractMessagesFromDoc);

      setMessagesCount(msgs.length);

      // tickets are derived from messages by keyword detection
      let t = 0;
      for (const m of msgs) {
        if (firstKeywordInText(m.text, keywordTermsLower)) t++;
      }
      setTicketsCount(t);

      setActiveKeywordsCount(keywords?.length || 0);
    } catch {
      // silent: dashboard should not crash
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keywordTermsLower]);

  useEffect(() => {
    setActiveKeywordsCount(keywords?.length || 0);
  }, [keywords]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Messages Processed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{messagesCount}</div>
          <p className="text-sm text-muted-foreground">Live count from Firestore.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tickets Created</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{ticketsCount}</div>
          <p className="text-sm text-muted-foreground">Derived from keyword hits.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Keywords</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{activeKeywordsCount}</div>
          <p className="text-sm text-muted-foreground">From your keyword settings.</p>
        </CardContent>
      </Card>
    </div>
  );
}
