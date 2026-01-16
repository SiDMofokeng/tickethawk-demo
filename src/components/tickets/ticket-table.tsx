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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { initialTickets } from "@/lib/data";
import type { TicketStatus } from "@/lib/types";
import { format } from "date-fns";

const statusStyles: Record<TicketStatus, string> = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300',
    'in-progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-300',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300',
};

export function TicketTable() {
  return (
    <Card>
        <CardHeader>
            <CardTitle>All Tickets</CardTitle>
            <CardDescription>A list of all tickets detected by the assistant.</CardDescription>
        </CardHeader>
        <CardContent>
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
                    {initialTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.id}</TableCell>
                        <TableCell>
                        <Badge variant="outline" className={statusStyles[ticket.status]}>
                            {ticket.status.replace('-', ' ')}
                        </Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant="secondary">{ticket.keywordDetected}</Badge>
                        </TableCell>
                        <TableCell>{ticket.groupName}</TableCell>
                        <TableCell>{ticket.senderName}</TableCell>
                        <TableCell className="flex items-center gap-2">
                             <Avatar className="h-6 w-6">
                                <AvatarImage src={ticket.assignedAdmin.avatarUrl} alt="Avatar" />
                                <AvatarFallback>{ticket.assignedAdmin.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {ticket.assignedAdmin.name}
                        </TableCell>
                        <TableCell className="text-right">
                            {format(new Date(ticket.timestamp), "PPpp")}
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
}
