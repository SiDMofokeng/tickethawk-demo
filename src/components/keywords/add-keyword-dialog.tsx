
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
import { Admin, Keyword } from "@/lib/types";
import { PlusCircle } from "lucide-react";

interface AddKeywordDialogProps {
  admins: Admin[];
  onAddKeyword: (keyword: Keyword) => void;
  children: React.ReactNode;
}

export function AddKeywordDialog({ admins, onAddKeyword, children }: AddKeywordDialogProps) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [ticketType, setTicketType] = useState<Keyword['ticketType'] | ''>('');
  const [assignedAdminId, setAssignedAdminId] = useState("");
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!term || !ticketType || !assignedAdminId) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please fill out all fields to add a keyword.",
        });
        return;
    }

    const newKeyword: Keyword = {
      id: `kw-${Date.now()}`,
      term,
      ticketType,
      assignedAdminId,
    };

    onAddKeyword(newKeyword);
    toast({
        title: "Keyword Added",
        description: `The keyword "${term}" has been added successfully.`,
    });

    // Reset form and close dialog
    setTerm("");
    setTicketType("");
    setAssignedAdminId("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Keyword</DialogTitle>
          <DialogDescription>
            Configure a new keyword for ticket creation and assign it to an admin.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="term" className="text-right">
              Keyword
            </Label>
            <Input
              id="term"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="col-span-3"
              placeholder="e.g., urgent"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ticketType" className="text-right">
              Ticket Type
            </Label>
            <Select onValueChange={(value) => setTicketType(value as Keyword['ticketType'])} value={ticketType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Urgent">Urgent</SelectItem>
                <SelectItem value="Support">Support</SelectItem>
                <SelectItem value="Feedback">Feedback</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="assignedAdmin" className="text-right">
              Assign to
            </Label>
            <Select onValueChange={setAssignedAdminId} value={assignedAdminId}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select an admin" />
                </SelectTrigger>
                <SelectContent>
                    {admins.map(admin => (
                        <SelectItem key={admin.id} value={admin.id}>{admin.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Keyword
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
