import {
  ChartNoAxesColumnIncreasing,
  Eye,
  LayoutDashboard,
  Search,
  Settings,
} from "lucide-react";
import Link from "next/link";

type SidebarPage = "dashboard" | "top-stocks" | "search" | "watchlist" | "settings";

type AppSidebarProps = {
  activePage: SidebarPage;
};

type NavItem = {
  id: SidebarPage;
  label: string;
  href: "/" | "/top-stocks" | "/search" | "/watchlist" | "/settings";
  icon: typeof LayoutDashboard;
};

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/", icon: LayoutDashboard },
  { id: "top-stocks", label: "Top Stocks", href: "/top-stocks", icon: ChartNoAxesColumnIncreasing },
  { id: "search", label: "Search", href: "/search", icon: Search },
  { id: "watchlist", label: "Watchlist", href: "/watchlist", icon: Eye },
  { id: "settings", label: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar({ activePage }: AppSidebarProps) {
  return (
    <aside className="hidden border-r border-slate-800/70 bg-[#030c24] px-6 pb-6 pt-7 lg:flex lg:flex-col">
      <div>
        <h2 className="app-display text-[32px] font-semibold leading-none tracking-tight">ScoreEngine</h2>
        <p className="mt-2 text-xs tracking-[0.22em] text-slate-400">PREMIUM ANALYTICS</p>
      </div>

      <nav className="mt-8 space-y-2">
        {navItems.map(({ id, label, href, icon: Icon }) => {
          const isActive = id === activePage;
          const className = [
            "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-base font-medium",
            isActive
              ? "border-blue-500/90 bg-slate-800/80 text-slate-100"
              : "border-transparent text-slate-400 hover:bg-slate-900/70 hover:text-slate-200",
          ].join(" ");

          return (
            <Link key={id} href={href} className={className}>
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
