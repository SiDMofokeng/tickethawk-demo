"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAppContext } from "@/context/app-context";
import type { Keyword } from "@/lib/types";

type ApiMsg = {
  id: string;
  text: string;
  senderName: string;
  groupName: string;
  timestampIso: string;
  type?: string;
};

function ClientTime({ timestamp }: { timestamp: string }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    setTime(formatDistanceToNow(new Date(timestamp), { addSuffix: true }));
  }, [timestamp]);

  if (!time) return null;
  return <p className="text-xs text-muted-foreground">{time}</p>;
}

export function LiveFeed() {
  const [messages, setMessages] = useState<ApiMsg[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();
  const { keywords, admins } = useAppContext();

  const keywordMap = useMemo(() => {
    const map = new Map<string, Keyword>();
    keywords.forEach((kw) => map.set(kw.term.toLowerCase(), kw));
    return map;
  }, [keywords]);

  const getKeywordInMessage = (text: string) => {
    const words = text.toLowerCase().split(/\s+/);
    for (const word of words) {
      const cleanWord = word.replace(/[.,!?]/g, "");
      if (keywordMap.has(cleanWord)) return keywordMap.get(cleanWord) || null;
    }
    return null;
  };

  const seenIds = useRef<Set<string>>(new Set());
  const didInitialLoad = useRef(false);

  async function fetchLatest() {
    try {
      setError(null);

      const res = await fetch("/api/messages?limit=50", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to load /api/messages");
      }

      const next: ApiMsg[] = Array.isArray(data.items) ? data.items : [];
      setMessages(next);

      // Toast only after first load, only for new items
      if (didInitialLoad.current) {
        for (const m of next) {
          if (seenIds.current.has(m.id)) continue;
          seenIds.current.add(m.id);

          const matchedKeyword = getKeywordInMessage(m.text);
          if (matchedKeyword) {
            const admin = admins.find(
              (a) => a.id === matchedKeyword.assignedAdminId
            );
            toast({
              title: "Keyword detected",
              description: `"${matchedKeyword.term}" in message from ${m.senderName}. ${
                admin ? `Assigned admin: ${admin.name}.` : ""
              }`,
            });
          }
        }
      } else {
        next.forEach((m) => seenIds.current.add(m.id));
        didInitialLoad.current = true;
      }
    } catch (e: any) {
      console.error("LiveFeed fetch error:", e);
      setError(e?.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLatest();
    const interval = setInterval(fetchLatest, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keywordMap, admins]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Live Message Feed
        </CardTitle>
        <CardDescription>
          Live messages pulled from Firestore via /api/messages.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <p className="font-semibold">Couldn’t load messages</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        )}

        <ScrollArea className="h-[450px] pr-4">
          <div className="flex flex-col gap-4">
            {loading && messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No messages yet. Send a WhatsApp message to trigger the webhook.
              </p>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((m) => {
                  const matchedKeyword = getKeywordInMessage(m.text);

                  return (
                    <motion.div
                      key={m.id}
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{
                        opacity: 0,
                        scale: 0.95,
                        transition: { duration: 0.2 },
                      }}
                      className={`p-4 rounded-lg border transition-colors ${
                        matchedKeyword
                          ? "border-accent/50 bg-accent/5"
                          : "bg-background"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{m.senderName}</p>
                          <p className="text-sm text-muted-foreground">
                            {m.groupName} • {m.type || "message"}
                          </p>
                        </div>
                        <ClientTime timestamp={m.timestampIso} />
                      </div>

                      <p className="mt-2 text-sm">{m.text}</p>

                      {matchedKeyword && (
                        <div className="mt-2 flex items-center gap-2">
                          <Badge
                            variant="destructive"
                            className="bg-accent hover:bg-accent/80"
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Keyword Detected: {matchedKeyword.term}
                          </Badge>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
