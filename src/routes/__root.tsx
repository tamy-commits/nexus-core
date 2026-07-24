import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { NexusProvider } from "@/lib/nexus-store";
import { NexusSidebar } from "@/components/nexus/Sidebar";
import { NexusHeader } from "@/components/nexus/Header";
import { AuditDrawer } from "@/components/nexus/AuditDrawer";
import { HumanReviewDrawer } from "@/components/nexus/HumanReviewDrawer";
import { EvidenceDrawer } from "@/components/nexus/EvidenceDrawer";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <p className="mt-3 text-sm text-muted-foreground">Página não encontrada.</p>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">Falha ao carregar</h1>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Scenario Lab — NEXUS" },
      {
        name: "description",
        content:
          "Central inteligente de prontidão documental — laboratório de cenários demonstrativos.",
      },
      { property: "og:title", content: "Scenario Lab — NEXUS" },
      {
        property: "og:description",
        content:
          "Central inteligente de prontidão documental — laboratório de cenários demonstrativos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Scenario Lab — NEXUS" },
      {
        name: "twitter:description",
        content:
          "Central inteligente de prontidão documental — laboratório de cenários demonstrativos.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/23b1134e-e553-485c-aa8e-b6bcba089684/id-preview-7ae1c292--e3682aff-c21c-49b3-862e-d3bf2fd57929.lovable.app-1784768660055.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/23b1134e-e553-485c-aa8e-b6bcba089684/id-preview-7ae1c292--e3682aff-c21c-49b3-862e-d3bf2fd57929.lovable.app-1784768660055.png",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <NexusProvider>
        <div className="flex h-screen w-full overflow-hidden bg-background">
          <NexusSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <NexusHeader />
            <main className="flex-1 overflow-y-auto">
              <Outlet />
            </main>
          </div>
          <AuditDrawer />
          <HumanReviewDrawer />
          <EvidenceDrawer />
          <Toaster position="bottom-right" />
        </div>
      </NexusProvider>
    </QueryClientProvider>
  );
}
