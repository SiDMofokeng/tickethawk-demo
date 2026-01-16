
import { PageHeader } from "@/components/page-header";
import { WhatsappForm } from "@/components/integrations/whatsapp-form";

export default function IntegrationsPage() {
    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <PageHeader 
                title="Integrations" 
                description="Connect your WhatsApp Business Account to Ticket Hawk."
            />
            <WhatsappForm />
        </div>
    );
}
