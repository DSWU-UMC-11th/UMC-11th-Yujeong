const BOOKMARK_STORAGE_KEY = "umcine-bookmarks";

export function normalizeBookmarkIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];

  return [
    ...new Set(
      value.filter(
        (movieId): movieId is number =>
          typeof movieId === "number" &&
          Number.isInteger(movieId) &&
          movieId > 0,
      ),
    ),
  ];
}

export function readBookmarkIds(): number[] {
  if (typeof localStorage === "undefined") return [];

  const storedValue = localStorage.getItem(BOOKMARK_STORAGE_KEY);
  if (!storedValue) return [];

  try {
    return normalizeBookmarkIds(JSON.parse(storedValue));
  } catch {
    return [];
  }
}

export function saveBookmarkIds(movieIds: number[]) {
  if (typeof localStorage === "undefined") return;

  localStorage.setItem(
    BOOKMARK_STORAGE_KEY,
    JSON.stringify(normalizeBookmarkIds(movieIds)),
  );
}
