import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AyahCard } from "@/components/AyahCard";
import { useQuranSettings } from "@/context/QuranContext";
import { useColors } from "@/hooks/useColors";
import { EXTRA_LANGUAGES } from "@/utils/languageManager";
import { getJuzAyahs, getJuzList, getSurah } from "@/utils/quranData";
import type { AyahData, SurahMeta } from "@/types/quran";

const BISMILLAH = "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
function toArabicNum(n: number): string {
  return String(n).replace(/[0-9]/g, (d) => ARABIC_DIGITS[parseInt(d)]);
}

type ListItem =
  | { type: "surah_header"; surah: SurahMeta; firstAyahInJuz: number }
  | { type: "ayah"; ayah: AyahData; isLastInRuku: boolean };

export default function JuzReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { settings, langMap } = useQuranSettings();

  const juzNumber = Number(id);
  const juzList = getJuzList();
  const juz = juzList.find((j) => j.number === juzNumber);
  const ayahs = useMemo(() => getJuzAyahs(juzNumber), [juzNumber]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const activeLang = settings.activeExtraLang
    ? EXTRA_LANGUAGES.find((l) => l.edition === settings.activeExtraLang)
    : null;

  const listItems = useMemo((): ListItem[] => {
    const items: ListItem[] = [];
    let prevSurahNumber = -1;

    for (let i = 0; i < ayahs.length; i++) {
      const ayah = ayahs[i];
      const nextAyah = ayahs[i + 1];

      if (ayah.surahNumber !== prevSurahNumber) {
        const surah = getSurah(ayah.surahNumber);
        if (surah) {
          items.push({
            type: "surah_header",
            surah,
            firstAyahInJuz: ayah.ayahNumber,
          });
        }
        prevSurahNumber = ayah.surahNumber;
      }

      const isLastInRuku = nextAyah
        ? ayah.ruku !== nextAyah.ruku
        : false;

      items.push({ type: "ayah", ayah, isLastInRuku });
    }

    return items;
  }, [ayahs]);

  if (!juz) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Juz not found</Text>
      </View>
    );
  }

  const rangeLabel =
    juz.startSurahNumber === juz.endSurahNumber
      ? `${juz.startSurahName} ${juz.startAyahNumber}–${juz.endAyahNumber}`
      : `${juz.startSurahName} ${juz.startAyahNumber} → ${juz.endSurahName} ${juz.endAyahNumber}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 8,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={styles.backBtn}
          hitSlop={8}
        >
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={[styles.juzArabicName, { color: colors.arabicText }]}>
            {juz.arabicName}
          </Text>
          <Text style={[styles.juzLabel, { color: colors.mutedForeground }]}>
            Para {juz.number} · {juz.ayahCount} Ayahs
          </Text>
          <Text
            style={[styles.rangeLabel, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            {rangeLabel}
          </Text>
        </View>

        <View style={styles.juzBadge}>
          <Text style={[styles.juzBadgeText, { color: colors.gold }]}>
            {toArabicNum(juz.number)}
          </Text>
        </View>
      </View>

      <FlatList
        data={listItems}
        keyExtractor={(item, index) =>
          item.type === "surah_header"
            ? `header-${item.surah.number}`
            : `ayah-${item.ayah.surahNumber}-${item.ayah.ayahNumber}-${index}`
        }
        renderItem={({ item }) => {
          if (item.type === "surah_header") {
            const showBismillah =
              item.firstAyahInJuz === 1 &&
              item.surah.number !== 1 &&
              item.surah.number !== 9;
            return (
              <View
                style={[
                  styles.surahHeader,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[styles.surahHeaderArabic, { color: colors.arabicText }]}
                >
                  {item.surah.nameArabic.replace(/^سُورَةُ\s+/, "")}
                </Text>
                <Text
                  style={[styles.surahHeaderEnglish, { color: colors.englishText }]}
                >
                  {item.surah.nameEnglish} · {item.surah.revelationType}
                </Text>
                {showBismillah && (
                  <Text
                    style={[styles.bismillah, { color: colors.arabicText }]}
                  >
                    {BISMILLAH}
                  </Text>
                )}
              </View>
            );
          }

          const extraText = langMap?.get(
            `${item.ayah.surahNumber}:${item.ayah.ayahNumber}`
          );
          return (
            <AyahCard
              ayah={item.ayah}
              extraText={extraText}
              extraLang={activeLang}
              isLastInRuku={item.isLastInRuku}
            />
          );
        }}
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24),
        }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        windowSize={7}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  juzArabicName: {
    fontSize: 22,
    fontFamily: "Amiri_400Regular",
    textAlign: "center",
  },
  juzLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  rangeLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  juzBadge: {
    width: 36,
    alignItems: "center",
  },
  juzBadgeText: {
    fontSize: 18,
    fontFamily: "Amiri_400Regular",
  },
  surahHeader: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 4,
  },
  surahHeaderArabic: {
    fontSize: 22,
    fontFamily: "Amiri_400Regular",
    textAlign: "center",
  },
  surahHeaderEnglish: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  bismillah: {
    fontSize: 20,
    fontFamily: "Amiri_400Regular",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 34,
  },
});
