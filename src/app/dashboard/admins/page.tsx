
"use client";

import { PageHeader } from "@/components/page-header";
import { AdminList } from "@/components/admins/admin-list";
import { AddAdminDialog } from "@/components/admins/add-admin-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useAppContext } from "@/context/app-context";

export default function AdminsPage() {
    const { admins, addAdmin } = useAppContext();

    return (
        <div className="flex flex-col gap-6">
            <PageHeader 
                title="Administrators" 
                description="Manage users who can be assigned to tickets."
            >
                <AddAdminDialog onAddAdmin={addAdmin}>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Admin
                    </Button>
                </AddAdminDialog>
            </PageHeader>
            <AdminList admins={admins} />
        </div>
    );
}
