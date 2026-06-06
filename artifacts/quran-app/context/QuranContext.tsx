import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { QuranSettings } from "@/types/quran";

const DEFAULT_SETTINGS: QuranSettings = {
  arabicFontSize: 28,
  translationFontSize: 15,
  showEnglish: true,
  showUrdu: true,
};

const STORAGE_KEY = "@quran_settings";

interface QuranContextValue {
  settings: QuranSettings;
  updateSettings: (partial: Partial<QuranSettings>) => void;
}

const QuranContext = createContext<QuranContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
});

export function QuranProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<QuranSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
      })
      .catch(() => {});
  }, []);

  const updateSettings = useCallback((partial: Partial<QuranSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  return (
    <QuranContext.Provider value={{ settings, updateSettings }}>
      {children}
    </QuranContext.Provider>
  );
}

export function useQuranSettings() {
  return useContext(QuranContext);
}
