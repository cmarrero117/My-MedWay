import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  GraduationCap,
  HeartPulse,
  FlaskConical,
  BookOpen,
  School,
  Award,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";


const navItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Academics", href: "/academics", icon: GraduationCap },
  { title: "Experience", href: "/experience", icon: HeartPulse },
  { title: "Research", href: "/research", icon: FlaskConical },
  { title: "MCAT Study", href: "/mcat", icon: BookOpen },
  { title: "Med Schools", href: "/schools", icon: School },
  { title: "Milestones", href: "/milestones", icon: Award },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="PreMed Tracker"
            >
              <path d="M12 2L12 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M5 9L19 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold leading-tight" data-testid="text-app-name">PreMed Tracker</h2>
            <p className="text-xs text-sidebar-foreground/60">Your journey to med school</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      data-testid={`nav-${item.title.toLowerCase().replace(/\s/g, "-")}`}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
     
    </Sidebar>
  );
}
