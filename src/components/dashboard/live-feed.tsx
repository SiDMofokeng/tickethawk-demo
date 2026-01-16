
"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Message, Ticket, Keyword } from '@/lib/types';
import { initialMessages, moreMessages, createTicketFromMessage } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAppContext } from '@/context/app-context';

function ClientTime({ timestamp }: { timestamp: string }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    setTime(formatDistanceToNow(new Date(timestamp), { addSuffix: true }));
  }, [timestamp]);

  if (!time) return null;

  return (
      <p className="text-xs text-muted-foreground">
          {time}
      </p>
  );
}


export function LiveFeed() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newTickets, setNewTickets] = useState<Ticket[]>([]);
  const { toast } = useToast();
  const { keywords, admins } = useAppContext();

  const keywordMap = useMemo(() => {
    const map = new Map<string, Keyword>();
    keywords.forEach(kw => map.set(kw.term.toLowerCase(), kw));
    return map;
  }, [keywords]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (moreMessages.length > 0) {
        const newMessage = moreMessages.shift()!;
        newMessage.timestamp = new Date().toISOString();
        setMessages(prev => [newMessage, ...prev].slice(0, 20));

        const words = newMessage.text.toLowerCase().split(/\s+/);
        for (const word of words) {
          const matchedKeyword = keywordMap.get(word.replace(/[.,!?]/g, ''));
          if (matchedKeyword) {
            const admin = admins.find(a => a.id === matchedKeyword.assignedAdminId);
            if (!admin) continue;

            const ticket = createTicketFromMessage(newMessage, matchedKeyword, admin);
            setNewTickets(prev => [ticket, ...prev]);
            
            toast({
              title: "New Ticket Created!",
              description: `Keyword "${matchedKeyword.term}" detected. Ticket ${ticket.id} assigned to ${admin?.name || 'N/A'}.`,
            });
            break; 
          }
        }
      } else {
        clearInterval(interval);
      }
    }, 5000); 

    return () => clearInterval(interval);
  }, [toast, keywordMap, admins]);

  const getKeywordInMessage = (text: string) => {
    const words = text.toLowerCase().split(/\s+/);
    for (const word of words) {
      const cleanWord = word.replace(/[.,!?]/g, '');
      if (keywordMap.has(cleanWord)) {
        return keywordMap.get(cleanWord);
      }
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Live Message Feed
        </CardTitle>
        <CardDescription>Monitoring WhatsApp groups in real-time.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[450px] pr-4">
          <div className="flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {messages.map((message) => {
                const matchedKeyword = getKeywordInMessage(message.text);
                return (
                  <motion.div
                    key={message.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className={`p-4 rounded-lg border transition-colors ${matchedKeyword ? 'border-accent/50 bg-accent/5' : 'bg-background'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{message.senderName}</p>
                        <p className="text-sm text-muted-foreground">{message.groupName}</p>
                      </div>
                      <ClientTime timestamp={message.timestamp} />
                    </div>
                    <p className="mt-2 text-sm">{message.text}</p>
                    {matchedKeyword && (
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="destructive" className="bg-accent hover:bg-accent/80">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Keyword Detected: {matchedKeyword.term}
                        </Badge>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
