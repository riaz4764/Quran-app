import AsyncStorage from "@react-native-async-storage/async-storage";
import type { DownloadStatus, ExtraLanguage } from "@/types/quran";

export const EXTRA_LANGUAGES: ExtraLanguage[] = [
  {
    id: "transliteration",
    edition: "en.transliteration",
    nameEnglish: "Roman (Transliteration)",
    nameNative: "Roman Urdu",
    direction: "ltr",
  },
  {
    id: "hindi",
    edition: "hi.hindi",
    nameEnglish: "Hindi",
    nameNative: "हिंदी",
    direction: "ltr",
  },
  {
    id: "french",
    edition: "fr.hamidullah",
    nameEnglish: "French",
    nameNative: "Français",
    direction: "ltr",
  },
  {
    id: "spanish",
    edition: "es.garcia",
    nameEnglish: "Spanish",
    nameNative: "Español",
    direction: "ltr",
  },
];

const CACHE_PREFIX = "@quran_extra_";

function cacheKey(edition: string) {
  return CACHE_PREFIX + edition.replace(".", "_");
}

export async function isLanguageDownloaded(edition: string): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(cacheKey(edition));
    return val !== null;
  } catch {
    return false;
  }
}

export async function downloadLanguage(
  edition: string,
  onProgress?: (status: DownloadStatus) => void
): Promise<Map<string, string> | null> {
  onProgress?.("downloading");
  try {
    const res = await fetch(
      `https://api.alquran.cloud/v1/quran/${edition}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const flatMap: Record<string, string> = {};
    for (const surah of json.data.surahs) {
      for (const ayah of surah.ayahs) {
        flatMap[`${surah.number}:${ayah.numberInSurah}`] = ayah.text;
      }
    }

    await AsyncStorage.setItem(cacheKey(edition), JSON.stringify(flatMap));
    onProgress?.("downloaded");
    return new Map(Object.entries(flatMap));
  } catch {
    onProgress?.("error");
    return null;
  }
}

export async function loadLanguageMap(
  edition: string
): Promise<Map<string, string> | null> {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(edition));
    if (!raw) return null;
    return new Map(Object.entries(JSON.parse(raw)));
  } catch {
    return null;
  }
}

export async function deleteLanguage(edition: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(cacheKey(edition));
  } catch {}
}

export async function getDownloadStatuses(): Promise<
  Record<string, DownloadStatus>
> {
  const result: Record<string, DownloadStatus> = {};
  await Promise.all(
    EXTRA_LANGUAGES.map(async (lang) => {
      result[lang.edition] = (await isLanguageDownloaded(lang.edition))
        ? "downloaded"
        : "not_downloaded";
    })
  );
  return result;
}
