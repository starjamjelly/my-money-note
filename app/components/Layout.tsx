import type { Child } from "hono/jsx";

interface LayoutProps {
  children: Child;
}

export function Layout({ children }: LayoutProps) {
  return <div class="space-y-6">{children}</div>;
}
