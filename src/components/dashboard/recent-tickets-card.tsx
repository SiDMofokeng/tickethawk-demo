"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/context/app-context";
import type { Keyword, Ticket } from "@/lib/types";
import { createTicketFromMessage, initialTickets } from "@/lib/data";

type ApiMsg = {
  id: string;
  text: string;
  senderName: string;
  groupName: string;
  timestampIso: string;
  type?: string;
};

export function RecentTicketsCard() {
  const { keywords, admins } = useAppContext();
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);

  const keywordMap = useMemo(() => {
    const map = new Map<string, Keyword>();
    keywords.forEach((kw) => map.set(kw.term.toLowerCase(), kw));
    return map;
  }, [keywords]);

  const detectKeyword = (text: string) => {
    const words = text.toLowerCase().split(/\s+/);
    for (const w of words) {
      const clean = w.replace(/[.,!?]/g, "");
      if (keywordMap.has(clean)) return keywordMap.get(clean) || null;
    }
    return null;
  };

  async function refreshTickets() {
    const res = await fetch("/api/messages?limit=100", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok || !data?.ok) return;

    const msgs: ApiMsg[] = Array.isArray(data.items) ? data.items : [];

    // Build tickets from live messages
    const generated: Ticket[] = [];
    for (const m of msgs) {
      const kw = detectKeyword(m.text);
      if (!kw) continue;

      const admin = admins.find((a) => a.id === kw.assignedAdminId);
      if (!admin) continue;

      // createTicketFromMessage expects the Message type from your app,
      // but your API msg has the same fields we need.
      const ticket = createTicketFromMessage(
        {
          id: m.id,
          senderName: m.senderName,
          groupName: m.groupName,
          text: m.text,
          timestamp: m.timestampIso,
        } as any,
        kw,
        admin
      );

      generated.push(ticket);
    }

    // Merge: keep your earlier demo tickets, but prepend live-derived ones
    const merged = [...generated, ...initialTickets];

    // Deduplicate by ticket.id
    const seen = new Set<string>();
    const deduped: Ticket[] = [];
    for (const t of merged) {
      if (seen.has(t.id)) continue;
      seen.add(t.id);
      deduped.push(t);
    }

    setTickets(deduped.slice(0, 10));
  }

  useEffect(() => {
    refreshTickets();
    const interval = setInterval(refreshTickets, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keywordMap, admins]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">Recent Tickets</CardTitle>
        <Link href="/dashboard/tickets" className="text-sm text-muted-foreground hover:underline">
          View all
        </Link>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {tickets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tickets yet.</p>
        ) : (
          tickets.slice(0, 5).map((t) => (
            <div key={t.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{t.messagePreview}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {t.groupName} • {t.senderName}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {t.status}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {t.keyword}
                  </Badge>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-mono">{t.id}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
