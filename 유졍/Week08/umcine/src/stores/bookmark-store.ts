import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { normalizeBookmarkIds } from "../utils/bookmark-storage";

export interface BookmarkStore {
  bookmarkedMovieIds: number[];
  toggleBookmark: (movieId: number) => void;
}

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set) => ({
      bookmarkedMovieIds: [],
      toggleBookmark: (movieId) =>
        set((state) => ({
          bookmarkedMovieIds: state.bookmarkedMovieIds.includes(movieId)
            ? state.bookmarkedMovieIds.filter((id) => id !== movieId)
            : [...state.bookmarkedMovieIds, movieId],
        })),
    }),
    {
      name: "umcine-bookmark-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        bookmarkedMovieIds: state.bookmarkedMovieIds,
      }),
      merge: (persistedState, currentState) => {
        const savedState = persistedState as Partial<BookmarkStore> | undefined;

        return {
          ...currentState,
          ...savedState,
          bookmarkedMovieIds:
            savedState?.bookmarkedMovieIds === undefined
              ? currentState.bookmarkedMovieIds
              : normalizeBookmarkIds(savedState.bookmarkedMovieIds),
        };
      },
    },
  ),
);
