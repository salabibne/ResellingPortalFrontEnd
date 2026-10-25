export const GRID_CLASS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
};

export function gridClass(columns?: number): string {
  const value = Math.min(Math.max(Number(columns) || 4, 1), 6);
  return GRID_CLASS[value] || GRID_CLASS[4];
}

/** Applies admin-selected ordering to a resource list. */
export function orderByIds<T extends { id: string }>(items: T[], ids?: string[]): T[] {
  if (!ids?.length) return items;
  const map = new Map(items.map((item) => [item.id, item]));
  return ids
    .map((id) => map.get(id))
    .filter((item): item is T => Boolean(item));
}
