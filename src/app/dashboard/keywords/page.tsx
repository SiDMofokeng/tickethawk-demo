
"use client";

import { PageHeader } from "@/components/page-header";
import { KeywordList } from "@/components/keywords/keyword-list";
import { KeywordSuggester } from "@/components/keywords/keyword-suggester";
import { Button } from "@/components/ui/button";
import { AddKeywordDialog } from "@/components/keywords/add-keyword-dialog";
import { PlusCircle } from "lucide-react";
import { useAppContext } from "@/context/app-context";

export default function KeywordsPage() {
    const { keywords, admins, addKeyword } = useAppContext();

    return (
        <div className="flex flex-col gap-6">
            <PageHeader 
                title="Keywords" 
                description="Manage and discover keywords to improve ticket creation."
            >
                <AddKeywordDialog admins={admins} onAddKeyword={addKeyword}>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Keyword
                    </Button>
                </AddKeywordDialog>
            </PageHeader>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <KeywordList keywords={keywords} admins={admins} />
                </div>
                <div>
                    <KeywordSuggester />
                </div>
            </div>
        </div>
    );
}
