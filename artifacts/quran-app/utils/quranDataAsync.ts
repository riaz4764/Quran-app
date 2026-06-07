import { getJuzList, getSurahs } from "./quranData";

let _preloaded = false;

export function preloadQuranData(): void {
  if (_preloaded) return;
  _preloaded = true;
  setTimeout(() => {
    getSurahs();
    getJuzList();
  }, 0);
}
