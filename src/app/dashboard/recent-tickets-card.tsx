"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
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

type UiTicket = {
  id: string; // TKT-xxxx
  messageId: string;
  senderName: string;
  groupName: string;
  text: string;
  keyword: string;
  assignedAdminName?: string;
  timestamp: string;
};

function ClientTime({ timestamp }: { timestamp: string }) {
  const [time, setTime] = useState("");
  useEffect(() => {
    setTime(formatDistanceToNow(new Date(timestamp), { addSuffix: true }));
  }, [timestamp]);
  if (!time) return null;
  return <span className="text-xs text-muted-foreground">{time}</span>;
}

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

function firstKeywordInText(text: string, keywordMap: Map<string, { term: string; assignedAdminId?: string }>) {
  const words = text.toLowerCase().split(/\s+/);
  for (const w of words) {
    const clean = w.replace(/[.,!?]/g, "");
    const hit = keywordMap.get(clean);
    if (hit) return hit;
  }
  return null;
}

function ticketIdFromMessageId(messageId: string) {
  const tail = messageId.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase();
  return `TKT-${tail || "0000"}`;
}

export function RecentTicketsCard() {
  const { keywords, admins } = useAppContext();

  const keywordMap = useMemo(() => {
    const m = new Map<string, { term: string; assignedAdminId?: string }>();
    (keywords || []).forEach((k) => m.set(k.term.toLowerCase(), { term: k.term, assignedAdminId: k.assignedAdminId }));
    return m;
  }, [keywords]);

  const [tickets, setTickets] = useState<UiTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      const res = await fetch("/api/messages", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to load /api/messages");
      }

      const docs: ApiMessageDoc[] = Array.isArray(data.items) ? data.items : [];
      const msgs = docs.flatMap(extractMessagesFromDoc);

      // newest first
      msgs.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

      const derived: UiTicket[] = [];
      for (const m of msgs) {
        const hit = firstKeywordInText(m.text, keywordMap);
        if (!hit) continue;

        const admin = admins?.find((a) => a.id === hit.assignedAdminId);

        derived.push({
          id: ticketIdFromMessageId(m.id),
          messageId: m.id,
          senderName: m.senderName,
          groupName: m.groupName,
          text: m.text,
          keyword: hit.term,
          assignedAdminName: admin?.name,
          timestamp: m.timestamp,
        });
      }

      setTickets(derived.slice(0, 20));
    } catch (e: any) {
      console.error("RecentTicketsCard error:", e);
      setError(e?.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [keywordMap, admins]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tickets</CardTitle>
        <CardDescription>The latest tickets created from message monitoring.</CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <p className="font-semibold">Couldn’t load tickets</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        )}

        <ScrollArea className="h-[450px] pr-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : tickets.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No tickets yet. Send a WhatsApp message that contains a keyword (e.g. “broken”, “login”, “feedback”).
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {tickets.map((t) => (
                <div key={t.messageId} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-semibold leading-tight">{t.text}</div>
                    <div className="text-right">
                      <div className="font-mono text-sm">{t.id}</div>
                      <ClientTime timestamp={t.timestamp} />
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>{t.groupName}</span>
                    <span>•</span>
                    <span>{t.senderName}</span>
                    {t.assignedAdminName ? (
                      <>
                        <span>•</span>
                        <span>Assigned: {t.assignedAdminName}</span>
                      </>
                    ) : null}
                  </div>

                  <div className="mt-2">
                    <Badge className="bg-accent hover:bg-accent/80">
                      Keyword: {t.keyword}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
