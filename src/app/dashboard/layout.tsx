
import { Logo } from "@/components/logo";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppProvider } from "@/context/app-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon" variant="sidebar" side="left">
          <SidebarHeader className="h-14 items-center justify-between px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
            <div className="group-data-[collapsible=icon]:hidden">
              <Logo />
            </div>
            <SidebarTrigger />
          </SidebarHeader>
          <SidebarContent>
            <MainNav />
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <div className="md:hidden">
              <Logo />
            </div>
            <div className="flex-1" />
            <UserNav />
          </header>
          <main className="flex-1 p-4 sm:px-6 sm:py-0">
            {children}
          </main>
        </SidebarInset>
      </div>
    </AppProvider>
  );
}
