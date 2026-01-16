import { PageHeader } from "@/components/page-header";
import { SimulatorCard } from "@/components/simulator/simulator-card";

export default function SimulatorPage() {
    return (
        <div className="flex flex-col gap-6">
            <PageHeader 
                title="Keyword Simulator" 
                description="Test your WhatsApp messages to see if they trigger a ticket."
            />
            <SimulatorCard />
        </div>
    );
}
