
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Admin, AdminRole } from "@/lib/types";
import { PlusCircle } from "lucide-react";

interface AddAdminDialogProps {
  onAddAdmin: (admin: Admin) => void;
  children: React.ReactNode;
}

export function AddAdminDialog({ onAddAdmin, children }: AddAdminDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole | ''>('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!name || !email || !role) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please fill out all fields to add an admin.",
        });
        return;
    }

    const newAdmin: Admin = {
      id: `admin-${Date.now()}`,
      name,
      email,
      role,
      avatarUrl: `https://picsum.photos/seed/${Date.now()}/40/40`
    };

    onAddAdmin(newAdmin);
    toast({
        title: "Admin Added",
        description: `An invitation has been sent to ${email}.`,
    });

    // Reset form and close dialog
    setName("");
    setEmail("");
    setRole("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Administrator</DialogTitle>
          <DialogDescription>
            Invite a new user and assign them a role.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., John Doe"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
              placeholder="e.g., john.doe@example.com"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Select onValueChange={(value) => setRole(value as AdminRole)} value={role}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Editor">Editor</SelectItem>
                <SelectItem value="Viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add & Send Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
