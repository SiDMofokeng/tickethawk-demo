"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { TicketStatus, Keyword } from "@/lib/types";
import { format } from "date-fns";
import { useAppContext } from "@/context/app-context";

const statusStyles: Record<TicketStatus, string> = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300",
  "in-progress":
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-300",
  resolved:
    "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300",
};

type ApiMessage = {
  id: string;
  text?: string;
  senderName?: string;
  from?: string;
  groupName?: string;
  displayPhoneNumber?: string;
  timestamp?: string;
  timestampIso?: string;
  createdAtIso?: string;
};

type UiTicket = {
  id: string;
  status: TicketStatus;
  keywordDetected: string;
  groupName: string;
  senderName: string;
  assignedAdmin: { name: string; avatarUrl?: string };
  timestamp: string;
};

function normalizeMessageTimestamp(m: ApiMessage): string {
  return (
    m.timestamp ||
    m.timestampIso ||
    m.createdAtIso ||
    new Date().toISOString()
  );
}

function normalizeMessageText(m: ApiMessage): string {
  return String(m.text ?? "").trim();
}

function normalizeSenderName(m: ApiMessage): string {
  return String(m.senderName || m.from || "Unknown");
}

function normalizeGroupName(m: ApiMessage): string {
  return String(m.groupName || m.displayPhoneNumber || "WhatsApp");
}

function makeTicketId(messageId: string): string {
  const clean = String(messageId || "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
  const tail = clean.slice(-6) || "000000";
  return `TKT-${tail}`;
}

function findKeyword(text: string, keywordMap: Map<string, Keyword>): Keyword | null {
  const words = text.toLowerCase().split(/\s+/);
  for (const w of words) {
    const clean = w.replace(/[.,!?]/g, "");
    const hit = keywordMap.get(clean);
    if (hit) return hit;
  }
  return null;
}

export function TicketTable() {
  const { keywords, admins } = useAppContext();

  const keywordMap = useMemo(() => {
    const map = new Map<string, Keyword>();
    keywords.forEach((kw) => map.set(kw.term.toLowerCase(), kw));
    return map;
  }, [keywords]);

  const [tickets, setTickets] = useState<UiTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadTickets() {
    try {
      setError(null);

      const res = await fetch("/api/messages", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to load /api/messages");
      }

      const items: ApiMessage[] = Array.isArray(data.items) ? data.items : [];

      // Build tickets from messages that contain a keyword
      const out: UiTicket[] = [];

      for (const msg of items) {
        const text = normalizeMessageText(msg);
        if (!text) continue;

        const matched = findKeyword(text, keywordMap);
        if (!matched) continue;

        const admin =
          admins.find((a) => a.id === matched.assignedAdminId) || null;

        out.push({
          id: makeTicketId(msg.id),
          status: "new",
          keywordDetected: matched.term,
          groupName: normalizeGroupName(msg),
          senderName: normalizeSenderName(msg),
          assignedAdmin: admin
            ? { name: admin.name, avatarUrl: admin.avatarUrl }
            : { name: "Unassigned" },
          timestamp: normalizeMessageTimestamp(msg),
        });
      }

      // De-dupe by ticket id (same message id => same ticket id)
      const byId = new Map<string, UiTicket>();
      for (const t of out) byId.set(t.id, t);

      const list = Array.from(byId.values()).sort((a, b) =>
        a.timestamp < b.timestamp ? 1 : -1
      );

      setTickets(list);
    } catch (e: any) {
      console.error("TicketTable load error:", e);
      setError(e?.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let interval: any;

    loadTickets();
    interval = setInterval(loadTickets, 5000);

    return () => {
      if (interval) clearInterval(interval);
    };
    // IMPORTANT: keywords/admins change affects matching/assignment
  }, [keywordMap, admins]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Tickets</CardTitle>
        <CardDescription>
          A list of all tickets detected by the assistant.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <p className="font-semibold">Couldn’t load tickets</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Keyword</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Sender</TableHead>
              <TableHead>Assigned Admin</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground">
                  No tickets yet. Send a WhatsApp message containing a keyword.
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.id}</TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusStyles[ticket.status]}
                    >
                      {ticket.status.replace("-", " ")}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary">{ticket.keywordDetected}</Badge>
                  </TableCell>

                  <TableCell>{ticket.groupName}</TableCell>
                  <TableCell>{ticket.senderName}</TableCell>

                  <TableCell className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={ticket.assignedAdmin.avatarUrl}
                        alt="Avatar"
                      />
                      <AvatarFallback>
                        {ticket.assignedAdmin.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {ticket.assignedAdmin.name}
                  </TableCell>

                  <TableCell className="text-right">
                    {format(new Date(ticket.timestamp), "PPpp")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
