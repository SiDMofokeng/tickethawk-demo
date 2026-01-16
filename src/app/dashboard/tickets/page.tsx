import { PageHeader } from "@/components/page-header";
import { TicketTable } from "@/components/tickets/ticket-table";
import { Button } from "@/components/ui/button";
import { File } from "lucide-react";

export default function TicketsPage() {
    return (
        <div className="flex flex-col gap-6">
            <PageHeader 
                title="Tickets" 
                description="Manage all tickets generated from keyword detection."
            >
                <Button>
                    <File className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </PageHeader>
            <TicketTable />
        </div>
    );
}
