import { PageHeader } from "@/components/page-header";
import { OverviewStats } from "@/components/dashboard/overview-stats";
import { RecentTicketsCard } from "@/components/dashboard/recent-tickets-card";
import { LiveFeed } from "@/components/dashboard/live-feed";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
        <PageHeader title="Dashboard" description="An overview of your WhatsApp monitoring activity." />
      
        <OverviewStats />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <LiveFeed />
            </div>
            <div>
                <RecentTicketsCard />
            </div>
        </div>
    </div>
  );
}
