"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { BaseFilter } from "@/lib/types";

interface BaseFilterContextType {
  selectedBase: BaseFilter;
  setSelectedBase: (base: BaseFilter) => void;
}

const BaseFilterContext = createContext<BaseFilterContextType>({
  selectedBase: "all",
  setSelectedBase: () => {},
});

export function BaseFilterProvider({ children }: { children: ReactNode }) {
  const [selectedBase, setSelectedBase] = useState<BaseFilter>("all");
  return (
    <BaseFilterContext.Provider value={{ selectedBase, setSelectedBase }}>
      {children}
    </BaseFilterContext.Provider>
  );
}

export function useBaseFilter() {
  return useContext(BaseFilterContext);
}
