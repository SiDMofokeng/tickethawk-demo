import { PageHeader } from "@/components/page-header";
import { SettingsForm } from "@/components/settings/settings-form";

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <PageHeader 
                title="Settings" 
                description="Configure your AI WhatsApp Assistant."
            />
            <SettingsForm />
        </div>
    );
}
