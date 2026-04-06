"use client";
import { BaseFilterProvider } from "@/contexts/base-filter-context";

export function PortalProviders({ children }: { children: React.ReactNode }) {
  return <BaseFilterProvider>{children}</BaseFilterProvider>;
}
