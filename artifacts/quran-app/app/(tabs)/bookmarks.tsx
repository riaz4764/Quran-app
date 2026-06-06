import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBookmarks } from "@/context/BookmarkContext";
import { useColors } from "@/hooks/useColors";
import { getSurah, getSurahAyahs } from "@/utils/quranData";
import type { Bookmark } from "@/types/quran";

export default function BookmarksScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { bookmarks, removeBookmark } = useBookmarks();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const sorted = [...bookmarks].sort((a, b) => b.savedAt - a.savedAt);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>Bookmarks</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>
          {bookmarks.length} saved {bookmarks.length === 1 ? "ayah" : "ayahs"}
        </Text>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(b) => `${b.surahNumber}:${b.ayahNumber}`}
        renderItem={({ item }) => (
          <BookmarkItem
            bookmark={item}
            colors={colors}
            router={router}
            onRemove={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              removeBookmark(item.surahNumber, item.ayahNumber);
            }}
          />
        )}
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 100),
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="bookmark" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No bookmarks yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Tap the bookmark icon on any ayah to save it here
            </Text>
          </View>
        }
      />
    </View>
  );
}

function BookmarkItem({
  bookmark,
  colors,
  router,
  onRemove,
}: {
  bookmark: Bookmark;
  colors: ReturnType<typeof useColors>;
  router: ReturnType<typeof useRouter>;
  onRemove: () => void;
}) {
  const surah = getSurah(bookmark.surahNumber);
  const ayahs = getSurahAyahs(bookmark.surahNumber);
  const ayah = ayahs.find((a) => a.ayahNumber === bookmark.ayahNumber);

  if (!surah || !ayah) return null;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed ? colors.cardElevated : colors.card,
          borderColor: colors.border,
        },
      ]}
      onPress={() =>
        router.push({
          pathname: "/surah/[id]",
          params: { id: String(bookmark.surahNumber) },
        })
      }
    >
      <View style={styles.cardHeader}>
        <View style={styles.refBadge}>
          <Text style={[styles.refText, { color: colors.gold }]}>
            {surah.nameEnglish} · {bookmark.surahNumber}:{bookmark.ayahNumber}
          </Text>
        </View>
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Feather name="x" size={16} color={colors.mutedForeground} />
        </Pressable>
      </View>
      <Text
        style={[styles.arabicText, { color: colors.arabicText }]}
        numberOfLines={2}
      >
        {ayah.arabic}
      </Text>
      <Text
        style={[styles.englishText, { color: colors.englishText }]}
        numberOfLines={3}
      >
        {ayah.english}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  count: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  refBadge: {},
  refText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  arabicText: {
    fontSize: 20,
    fontFamily: "Amiri_400Regular",
    textAlign: "right",
    lineHeight: 34,
    marginBottom: 8,
  },
  englishText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
  },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
});
