import type { QuranRawData } from "./quranLoader.types";

export async function loadQuranRawData(): Promise<QuranRawData> {
  return {
    arabic: require("@/assets/data/arabic.json"),
    english: require("@/assets/data/english.json"),
    urdu: require("@/assets/data/urdu.json"),
  };
}
