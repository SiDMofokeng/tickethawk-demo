
"use client";

import {
  Home,
  Tag,
  Settings,
  BrainCircuit,
  MessageSquarePlus,
  Users,
  Webhook,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const links = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/tickets", icon: Tag, label: "Tickets" },
  { href: "/dashboard/keywords", icon: BrainCircuit, label: "Keywords" },
  { href: "/dashboard/admins", icon: Users, label: "Admins" },
  { href: "/dashboard/integrations", icon: Webhook, label: "Integrations" },
  { href: "/dashboard/simulator", icon: MessageSquarePlus, label: "Simulator" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
          <Link href={link.href} passHref>
            <SidebarMenuButton
              isActive={pathname === link.href}
              tooltip={link.label}
            >
              <link.icon />
              <span>{link.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
