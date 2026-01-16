
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
  import { Badge } from "@/components/ui/badge";
  import { Admin, Keyword } from "@/lib/types";
  
  const typeStyles: Record<Keyword['ticketType'], string> = {
    Urgent: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300',
    Support: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300',
    Feedback: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border-purple-300',
    General: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-300',
  };

  interface KeywordListProps {
    keywords: Keyword[];
    admins: Admin[];
  }

  export function KeywordList({ keywords, admins }: KeywordListProps) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Keyword Configuration</CardTitle>
          <CardDescription>List of all keywords and their routing rules.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Keyword</TableHead>
                <TableHead>Ticket Type</TableHead>
                <TableHead>Assigned Admin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keywords.map((keyword) => {
                  const admin = admins.find(a => a.id === keyword.assignedAdminId);
                  return (
                    <TableRow key={keyword.id}>
                        <TableCell className="font-medium">
                            <Badge variant="secondary" className="text-base">{keyword.term}</Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline" className={`${typeStyles[keyword.ticketType]} border`}>{keyword.ticketType}</Badge>
                        </TableCell>
                        <TableCell>
                            {admin && (
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={admin.avatarUrl} alt="Avatar" />
                                        <AvatarFallback>{admin.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span>{admin.name}</span>
                                </div>
                            )}
                        </TableCell>
                    </TableRow>
                  )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }
