import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Wand2, 
  TestTubes, 
  Network, 
  MessageSquare, 
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Generate", href: "/generate", icon: Wand2 },
  { name: "Test Suites", href: "/test-suites", icon: TestTubes },
  { name: "Traceability", href: "/traceability", icon: Network },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-sidebar">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-sidebar-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
            <TestTubes className="h-5 w-5" />
          </div>
          <span>Aero QA</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = location === item.href || location.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 text-xs text-sidebar-foreground/50 border-t">
        Aero QA v1.0.0
      </div>
    </div>
  );
}
