import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { initialTickets } from "@/lib/data";
import { Tag } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

export function RecentTicketsCard() {
  const recentTickets = initialTickets.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Recent Tickets
        </CardTitle>
        <CardDescription>
          The latest tickets created from message monitoring.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {recentTickets.map((ticket) => (
          <div key={ticket.id} className="flex items-center gap-4">
            <Avatar className="hidden h-9 w-9 sm:flex">
              <AvatarImage src={ticket.assignedAdmin.avatarUrl} alt="Avatar" />
              <AvatarFallback>{ticket.assignedAdmin.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">
                {ticket.fullMessageText}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">{ticket.groupName}</span> &middot; {ticket.senderName}
              </p>
            </div>
            <div className="ml-auto text-right">
                <p className="font-medium">{ticket.id}</p>
                 <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(ticket.timestamp), { addSuffix: true })}
                </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
