import type { QuranRawData } from "./quranLoader.types";

export async function loadQuranRawData(): Promise<QuranRawData> {
  const [arabicRes, englishRes, urduRes] = await Promise.all([
    fetch("/quran-data/arabic.json"),
    fetch("/quran-data/english.json"),
    fetch("/quran-data/urdu.json"),
  ]);
  const [arabic, english, urdu] = await Promise.all([
    arabicRes.json(),
    englishRes.json(),
    urduRes.json(),
  ]);
  return { arabic, english, urdu };
}
