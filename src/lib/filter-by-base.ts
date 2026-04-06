import type { Base } from "@/lib/types";

type BaseFilter = "all" | Base;

export function filterByBase<T extends { base: Base }>(
  items: T[],
  selectedBase: BaseFilter
): T[] {
  if (selectedBase === "all") return items;
  return items.filter((item) => item.base === selectedBase);
}
