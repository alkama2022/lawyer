import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  CircleUser,
  FileText,
  Gavel,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  PieChart,
  Scale,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth";
import { fmtRelative, initials } from "@/lib/format";
import { notificationsApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { GlobalSearch } from "./global-search";
import type { AppNotification } from "@/lib/types";

const NAV = [
  {
    label: "Overview",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/cases", label: "My Cases", icon: Gavel, search: { mine: "yes" } },
      { to: "/cases", label: "All Cases", icon: Scale },
    ],
  },
  {
    label: "Case outcomes",
    items: [
      { to: "/cases", label: "Active", icon: Scale, search: { status: "Active" } },
      { to: "/outcomes", label: "Won", icon: Scale, search: { tab: "won" } },
      { to: "/outcomes", label: "Lost", icon: Scale, search: { tab: "lost" } },
      { to: "/outcomes", label: "Settled", icon: Scale, search: { tab: "settled" } },
      { to: "/outcomes", label: "Withdrawn", icon: Scale, search: { tab: "withdrawn" } },
      { to: "/outcomes", label: "Pending", icon: Scale, search: { tab: "pending" } },
      { to: "/outcomes", label: "Appealed", icon: Scale, search: { tab: "appealed" } },
    ],
  },
  {
    label: "Practice",
    items: [
      { to: "/clients", label: "Clients", icon: Users },
      { to: "/hearings", label: "Hearings & Calendar", icon: CalendarDays },
      { to: "/documents", label: "Documents", icon: FileText },
      { to: "/reports", label: "Reports & Analytics", icon: PieChart },
      { to: "/record", label: "Professional Record", icon: ShieldCheck },
      { to: "/notifications", label: "Notifications", icon: Bell },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
] as const;

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search }) as unknown as Record<
    string,
    unknown
  >;

  const isActive = (item: { to: string; search?: Record<string, string> }) => {
    if (pathname !== item.to) return false;
    if (!item.search) return !search["status"] && !search["mine"] && !search["tab"];
    return Object.entries(item.search).every(([k, v]) => String(search[k] ?? "") === v);
  };

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
          <Scale className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="font-display text-[0.95rem] font-semibold text-sidebar-accent-foreground">
            Lexfolio
          </p>
          <p className="text-[0.7rem] tracking-wide text-sidebar-foreground/60">Case Management</p>
        </div>
      </div>
      <Separator className="bg-sidebar-border" />
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {NAV.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-2 text-[0.65rem] font-semibold tracking-[0.14em] text-sidebar-foreground/45 uppercase">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={`${item.to}-${item.label}`}>
                    <Link
                      to={item.to}
                      search={("search" in item ? item.search : {}) as never}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        isActive(item as never)
                          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <item.icon className="size-4 shrink-0 opacity-80" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>
      <div className="border-t border-sidebar-border px-5 py-4 text-[0.7rem] text-sidebar-foreground/55">
        Confidential — privileged client data. Do not share screens in public.
      </div>
    </div>
  );
}

function NotificationBell() {
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list(),
  });
  const [dismissed, setDismissed] = useState<string[]>([]);
  const items: AppNotification[] = data ?? [];
  const unread = items.filter((n) => !n.read && !dismissed.includes(n.id));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-[1.1rem]" />
          {unread.length > 0 && (
            <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[0.6rem] font-semibold text-destructive-foreground">
              {unread.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[22rem] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setDismissed(items.map((n) => n.id))}
          >
            Mark all read
          </Button>
        </div>
        <ScrollArea className="max-h-80">
          <ul className="divide-y divide-border">
            {items.slice(0, 8).map((n) => (
              <li key={n.id} className="px-4 py-3">
                <div className="flex items-start gap-2">
                  <span
                    className={cn(
                      "mt-1.5 size-1.5 shrink-0 rounded-full",
                      n.read || dismissed.includes(n.id) ? "bg-border" : "bg-gold",
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{n.detail}</p>
                    <p className="mt-0.5 text-[0.7rem] text-muted-foreground/80">
                      {fmtRelative(n.at)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
        <div className="border-t border-border p-2">
          <Button asChild variant="ghost" size="sm" className="w-full">
            <Link to="/notifications">Open notification centre</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SessionTimer() {
  const { expiresAt, extendSession } = useAuth();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  if (!expiresAt) return null;
  const minutes = Math.max(0, Math.round((expiresAt - now) / 60_000));
  if (minutes > 10) return null;
  return (
    <button
      onClick={extendSession}
      className="hidden rounded-md border border-warning/40 bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning-foreground sm:block"
    >
      Session ends in {minutes}m — extend
    </button>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const name = user?.name ?? "Lawyer";
  const who = useMemo(() => initials(name), [name]);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-[16.5rem] shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-[16.5rem]">
          <SidebarContent />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[17rem] border-0 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarContent onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>

            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-9 flex-1 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary md:max-w-md"
            >
              <Search className="size-4" />
              <span className="truncate">Search cases, clients, courts…</span>
              <kbd className="ml-auto hidden rounded border border-border px-1.5 text-[0.65rem] md:inline">
                ⌘K
              </kbd>
            </button>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <SessionTimer />
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2.5 rounded-md py-1 pr-1.5 pl-1 transition-colors hover:bg-secondary">
                    <span className="relative">
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                          {who}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-card bg-success" />
                    </span>
                    <span className="hidden text-left leading-tight sm:block">
                      <span className="block text-sm font-medium">{name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {user?.title ?? "Counsel"}
                      </span>
                    </span>
                    <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/record">
                      <CircleUser className="size-4" /> Professional record
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <KeyRound className="size-4" /> Change password
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      signOut();
                      navigate({ to: "/", replace: true });
                    }}
                  >
                    <LogOut className="size-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[100rem] flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
