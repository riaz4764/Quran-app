import type { QuranRawData } from "./quranLoader.types";

const BASE = (process.env.EXPO_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");

export async function loadQuranRawData(): Promise<QuranRawData> {
  const [arabicRes, englishRes, urduRes] = await Promise.all([
    fetch(`${BASE}/quran-data/arabic.json`),
    fetch(`${BASE}/quran-data/english.json`),
    fetch(`${BASE}/quran-data/urdu.json`),
  ]);
  const [arabic, english, urdu] = await Promise.all([
    arabicRes.json(),
    englishRes.json(),
    urduRes.json(),
  ]);
  return { arabic, english, urdu };
}
