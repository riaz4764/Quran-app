import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Bookmark } from "@/types/quran";

const STORAGE_KEY = "@quran_bookmarks";

interface BookmarkContextValue {
  bookmarks: Bookmark[];
  isBookmarked: (surahNumber: number, ayahNumber: number) => boolean;
  toggleBookmark: (surahNumber: number, ayahNumber: number) => void;
  removeBookmark: (surahNumber: number, ayahNumber: number) => void;
}

const BookmarkContext = createContext<BookmarkContextValue>({
  bookmarks: [],
  isBookmarked: () => false,
  toggleBookmark: () => {},
  removeBookmark: () => {},
});

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setBookmarks(JSON.parse(raw));
      })
      .catch(() => {});
  }, []);

  const save = (next: Bookmark[]) => {
    setBookmarks(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  };

  const isBookmarked = useCallback(
    (surahNumber: number, ayahNumber: number) =>
      bookmarks.some(
        (b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
      ),
    [bookmarks]
  );

  const toggleBookmark = useCallback(
    (surahNumber: number, ayahNumber: number) => {
      setBookmarks((prev) => {
        const exists = prev.some(
          (b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
        );
        const next = exists
          ? prev.filter(
              (b) =>
                !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber)
            )
          : [...prev, { surahNumber, ayahNumber, savedAt: Date.now() }];
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    []
  );

  const removeBookmark = useCallback(
    (surahNumber: number, ayahNumber: number) => {
      setBookmarks((prev) => {
        const next = prev.filter(
          (b) =>
            !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber)
        );
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    []
  );

  return (
    <BookmarkContext.Provider
      value={{ bookmarks, isBookmarked, toggleBookmark, removeBookmark }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  return useContext(BookmarkContext);
}
