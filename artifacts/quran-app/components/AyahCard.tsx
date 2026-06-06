import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useBookmarks } from "@/context/BookmarkContext";
import { useQuranSettings } from "@/context/QuranContext";
import { useColors } from "@/hooks/useColors";
import type { AyahData } from "@/types/quran";

interface Props {
  ayah: AyahData;
  surahName?: string;
}

export function AyahCard({ ayah, surahName }: Props) {
  const colors = useColors();
  const { settings } = useQuranSettings();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(ayah.surahNumber, ayah.ayahNumber);

  const handleBookmark = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleBookmark(ayah.surahNumber, ayah.ayahNumber);
  };

  return (
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
        <Pressable
          onPress={handleBookmark}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Feather
            name={bookmarked ? "bookmark" : "bookmark"}
            size={18}
            color={bookmarked ? colors.gold : colors.mutedForeground}
          />
        </Pressable>
      </View>

      <Text
        style={[
          styles.arabic,
          {
            color: colors.arabicText,
            fontSize: settings.arabicFontSize,
          },
        ]}
      >
        {ayah.arabic}
      </Text>

      {settings.showEnglish && ayah.english ? (
        <View style={[styles.translationBlock, { borderTopColor: colors.border }]}>
          <Text
            style={[
              styles.translationLabel,
              { color: colors.gold },
            ]}
          >
            English
          </Text>
          <Text
            style={[
              styles.translationText,
              {
                color: colors.englishText,
                fontSize: settings.translationFontSize,
              },
            ]}
          >
            {ayah.english}
          </Text>
        </View>
      ) : null}

      {settings.showUrdu && ayah.urdu ? (
        <View style={[styles.translationBlock, { borderTopColor: colors.border }]}>
          <Text style={[styles.translationLabel, { color: colors.gold }]}>
            اردو
          </Text>
          <Text
            style={[
              styles.urduText,
              {
                color: colors.urduText,
                fontSize: settings.translationFontSize + 2,
              },
            ]}
          >
            {ayah.urdu}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
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
  arabic: {
    textAlign: "right",
    fontFamily: "Amiri_400Regular",
    lineHeight: 52,
    letterSpacing: 0.5,
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
    lineHeight: 22,
  },
  urduText: {
    fontFamily: "Amiri_400Regular",
    textAlign: "right",
    lineHeight: 28,
  },
});
