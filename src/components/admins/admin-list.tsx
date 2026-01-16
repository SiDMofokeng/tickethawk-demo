
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
  import { Admin, AdminRole } from "@/lib/types";
  
  const roleStyles: Record<AdminRole, string> = {
    Admin: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300',
    Editor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300',
    Viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-300',
  };

  interface AdminListProps {
    admins: Admin[];
  }

  export function AdminList({ admins }: AdminListProps) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Administrators</CardTitle>
          <CardDescription>List of all users with access.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                    <TableRow key={admin.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={admin.avatarUrl} alt="Avatar" />
                                    <AvatarFallback>{admin.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{admin.name}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            {admin.email}
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline" className={`${roleStyles[admin.role]} border`}>{admin.role}</Badge>
                        </TableCell>
                    </TableRow>
                  )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }
