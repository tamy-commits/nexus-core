import { Link, useRouterState } from "@tanstack/react-router";
import { FlaskConical, Briefcase, GitCompare, RotateCcw } from "lucide-react";
import { useNexus } from "@/lib/nexus-store";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Scenario Lab", icon: FlaskConical },
  { to: "/workspace", label: "Case Workspace", icon: Briefcase },
  { to: "/evaluation", label: "Evaluation Studio", icon: GitCompare },
] as const;

export function NexusSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { resetScenario, activeKey } = useNexus();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-5 pt-6 pb-8">
        <div className="text-display text-2xl leading-none tracking-tight text-sidebar-foreground">
          NEXUS
        </div>
        <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-sidebar-foreground/55">
          Prontidão Documental
        </div>
      </div>

      <nav className="flex-1 px-3">
        <ul className="space-y-0.5">
          {nav.map((n) => {
            const active = pathname === n.to;
            const Icon = n.icon;
            return (
              <li key={n.to}>
                <Link
                  to={n.to}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.6} />
                  <span>{n.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="my-5 h-px bg-sidebar-border" />

        <button
          onClick={resetScenario}
          disabled={!activeKey}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw className="h-4 w-4 shrink-0" strokeWidth={1.6} />
          <span>Reiniciar cenário</span>
        </button>
      </nav>

      <div className="px-5 py-4">
        <div className="flex items-center gap-2 rounded-md border border-sidebar-border/60 px-3 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
          <span className="text-[11px] uppercase tracking-[0.12em] text-sidebar-foreground/70">
            Ambiente demonstrativo
          </span>
        </div>
      </div>
    </aside>
  );
}
