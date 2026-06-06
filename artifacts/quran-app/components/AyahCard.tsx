import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useBookmarks } from "@/context/BookmarkContext";
import { useQuranSettings } from "@/context/QuranContext";
import { useColors } from "@/hooks/useColors";
import type { AyahData, ExtraLanguage } from "@/types/quran";

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
function toArabicNum(n: number): string {
  return String(n).replace(/[0-9]/g, (d) => ARABIC_DIGITS[parseInt(d)]);
}

interface Props {
  ayah: AyahData;
  extraText?: string;
  extraLang?: ExtraLanguage | null;
  isLastInRuku?: boolean;
}

export function AyahCard({ ayah, extraText, extraLang, isLastInRuku }: Props) {
  const colors = useColors();
  const { settings } = useQuranSettings();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(ayah.surahNumber, ayah.ayahNumber);

  const handleBookmark = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleBookmark(ayah.surahNumber, ayah.ayahNumber);
  };

  const arabicWithEnd = `${ayah.arabic} \u06DD${toArabicNum(ayah.ayahNumber)}`;

  return (
    <>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.header}>
          <View style={[styles.ayahBadge, { backgroundColor: colors.accent }]}>
            <Text style={[styles.ayahBadgeText, { color: colors.gold }]}>
              ﴿{ayah.ayahNumber}﴾
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={[styles.juzLabel, { color: colors.mutedForeground }]}>
              Juz {ayah.juz} · P.{ayah.page}
            </Text>
            <Pressable
              onPress={handleBookmark}
              hitSlop={8}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Feather
                name="bookmark"
                size={18}
                color={bookmarked ? colors.gold : colors.mutedForeground}
              />
            </Pressable>
          </View>
        </View>

        <Text
          style={[
            styles.arabic,
            {
              color: colors.arabicText,
              fontSize: settings.arabicFontSize,
              lineHeight: settings.arabicFontSize * 1.85,
            },
          ]}
        >
          {arabicWithEnd}
        </Text>

        {settings.showEnglish && ayah.english ? (
          <View
            style={[styles.translationBlock, { borderTopColor: colors.border }]}
          >
            <Text style={[styles.translationLabel, { color: colors.gold }]}>
              English
            </Text>
            <Text
              style={[
                styles.translationText,
                {
                  color: colors.englishText,
                  fontSize: settings.translationFontSize,
                  lineHeight: settings.translationFontSize * 1.5,
                },
              ]}
            >
              {ayah.english}
            </Text>
          </View>
        ) : null}

        {settings.showUrdu && ayah.urdu ? (
          <View
            style={[styles.translationBlock, { borderTopColor: colors.border }]}
          >
            <Text style={[styles.translationLabel, { color: colors.gold }]}>
              اردو
            </Text>
            <Text
              style={[
                styles.urduText,
                {
                  color: colors.urduText,
                  fontSize: settings.translationFontSize + 2,
                  lineHeight: (settings.translationFontSize + 2) * 1.7,
                },
              ]}
            >
              {ayah.urdu}
            </Text>
          </View>
        ) : null}

        {extraText && extraLang ? (
          <View
            style={[styles.translationBlock, { borderTopColor: colors.border }]}
          >
            <Text style={[styles.translationLabel, { color: "#7AAFCF" }]}>
              {extraLang.nameNative}
            </Text>
            <Text
              style={[
                extraLang.direction === "rtl"
                  ? styles.urduText
                  : styles.translationText,
                {
                  color: "#A8C8E0",
                  fontSize: settings.translationFontSize,
                  lineHeight: settings.translationFontSize * 1.5,
                },
              ]}
            >
              {extraText}
            </Text>
          </View>
        ) : null}
      </View>

      {isLastInRuku ? (
        <View
          style={[styles.rukooRow, { borderColor: colors.border }]}
        >
          <View style={[styles.rukooLine, { backgroundColor: colors.border }]} />
          <View
            style={[styles.rukooBadge, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.rukooAyn, { color: colors.gold }]}>ۛ</Text>
            <Text style={[styles.rukooText, { color: colors.mutedForeground }]}>
              Rukoo'
            </Text>
          </View>
          <View style={[styles.rukooLine, { backgroundColor: colors.border }]} />
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  ayahBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  ayahBadgeText: {
    fontSize: 13,
    fontFamily: "Amiri_400Regular",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  juzLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  arabic: {
    textAlign: "right",
    fontFamily: "Amiri_400Regular",
    letterSpacing: 0.3,
  },
  translationBlock: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  translationLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  translationText: {
    fontFamily: "Inter_400Regular",
  },
  urduText: {
    fontFamily: "Amiri_400Regular",
    textAlign: "right",
  },
  rukooRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 8,
    gap: 10,
  },
  rukooLine: {
    flex: 1,
    height: 1,
  },
  rukooLine2: {
    flex: 1,
    height: 1,
  },
  rukoobadge2: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  rukooAyn: {
    fontSize: 16,
    fontFamily: "Amiri_400Regular",
  },
  rukooText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
  },
  rukooBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
});
