"use client";
import { BaseFilterProvider } from "@/contexts/base-filter-context";
import { RoleProvider } from "@/contexts/role-context";

export function PortalProviders({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <BaseFilterProvider>{children}</BaseFilterProvider>
    </RoleProvider>
  );
}
