import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">404</p>
        <h1 className="font-display mt-6 text-5xl text-foreground">Nothing here.</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          The page you were looking for isn't here. That's alright.
        </p>
        <div className="mt-10">
          <Link
            to="/"
            className="inline-flex items-center justify-center border-b border-foreground/40 pb-1 text-sm tracking-wide text-foreground transition hover:border-foreground"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Interruption</p>
        <h1 className="font-display mt-6 text-4xl text-foreground">
          Something didn't load.
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Take a breath. You can try again — nothing you shared has been lost.
        </p>
        <div className="mt-10 flex justify-center gap-6 text-sm">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="border-b border-foreground/40 pb-1 text-foreground transition hover:border-foreground"
          >
            Try again
          </button>
          <a href="/" className="border-b border-transparent pb-1 text-muted-foreground transition hover:text-foreground">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Beyond What You See — An AI-Powered Self Reflection Experience" },
      {
        name: "description",
        content:
          "A quiet, cinematic reflection experience. Understand yourself — beyond appearance, comparison, and judgement.",
      },
      { name: "theme-color", content: "#050505" },
      { property: "og:title", content: "Beyond What You See" },
      {
        property: "og:description",
        content:
          "An AI-powered reflection experience designed to help you understand yourself — not judge yourself.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
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
      <Outlet />
    </QueryClientProvider>
  );
}
