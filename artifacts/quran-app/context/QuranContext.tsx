import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { QuranSettings } from "@/types/quran";
import { loadLanguageMap } from "@/utils/languageManager";

const DEFAULT_SETTINGS: QuranSettings = {
  arabicFontSize: 28,
  translationFontSize: 15,
  showEnglish: true,
  showUrdu: true,
  activeExtraLang: null,
};

const STORAGE_KEY = "@quran_settings";

interface QuranContextValue {
  settings: QuranSettings;
  updateSettings: (partial: Partial<QuranSettings>) => void;
  langMap: Map<string, string> | null;
  setActiveExtraLang: (edition: string | null) => Promise<void>;
}

const QuranContext = createContext<QuranContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  langMap: null,
  setActiveExtraLang: async () => {},
});

export function QuranProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<QuranSettings>(DEFAULT_SETTINGS);
  const [langMap, setLangMap] = useState<Map<string, string> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(async (raw) => {
        if (raw) {
          const saved: QuranSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
          setSettings(saved);
          if (saved.activeExtraLang) {
            const map = await loadLanguageMap(saved.activeExtraLang);
            setLangMap(map);
          }
        }
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

  const setActiveExtraLang = useCallback(async (edition: string | null) => {
    if (!edition) {
      setLangMap(null);
      setSettings((prev) => {
        const next = { ...prev, activeExtraLang: null };
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
      return;
    }
    const map = await loadLanguageMap(edition);
    setLangMap(map);
    setSettings((prev) => {
      const next = { ...prev, activeExtraLang: edition };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  return (
    <QuranContext.Provider
      value={{ settings, updateSettings, langMap, setActiveExtraLang }}
    >
      {children}
    </QuranContext.Provider>
  );
}

export function useQuranSettings() {
  return useContext(QuranContext);
}
