import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { getSurah, searchAyahs } from "@/utils/quranData";
import type { AyahData } from "@/types/quran";

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AyahData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleSearch = () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setTimeout(() => {
      setResults(searchAyahs(query));
      setLoading(false);
    }, 50);
  };

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
        <Text style={[styles.title, { color: colors.text }]}>Search</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Search in translations & Arabic..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <Pressable
            onPress={handleSearch}
            style={[styles.searchBtn, { backgroundColor: colors.gold }]}
          >
            <Feather name="search" size={18} color={colors.background} />
          </Pressable>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          style={styles.loader}
          color={colors.gold}
          size="large"
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(a) => `${a.surahNumber}:${a.ayahNumber}`}
          renderItem={({ item }) => (
            <ResultCard ayah={item} colors={colors} router={router} />
          )}
          contentContainerStyle={{
            paddingTop: 8,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 100),
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            searched ? (
              <View style={styles.empty}>
                <Feather name="search" size={32} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  No results found
                </Text>
              </View>
            ) : (
              <View style={styles.empty}>
                <Feather name="book-open" size={32} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  Search across all ayahs
                </Text>
                <Text style={[styles.emptyHint, { color: colors.mutedForeground }]}>
                  English · Arabic · Urdu
                </Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
}

function ResultCard({
  ayah,
  colors,
  router,
}: {
  ayah: AyahData;
  colors: ReturnType<typeof useColors>;
  router: ReturnType<typeof useRouter>;
}) {
  const surah = getSurah(ayah.surahNumber);
  return (
    <Pressable
      style={({ pressed }) => [
        styles.resultCard,
        {
          backgroundColor: pressed ? colors.cardElevated : colors.card,
          borderColor: colors.border,
        },
      ]}
      onPress={() =>
        router.push({
          pathname: "/surah/[id]",
          params: { id: String(ayah.surahNumber) },
        })
      }
    >
      <View style={styles.resultMeta}>
        <Text style={[styles.resultRef, { color: colors.gold }]}>
          {surah?.nameEnglish} · {ayah.surahNumber}:{ayah.ayahNumber}
        </Text>
      </View>
      <Text
        style={[styles.resultArabic, { color: colors.arabicText }]}
        numberOfLines={2}
      >
        {ayah.arabic}
      </Text>
      <Text
        style={[styles.resultEnglish, { color: colors.englishText }]}
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
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    gap: 10,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  loader: {
    marginTop: 60,
  },
  resultCard: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  resultMeta: {
    marginBottom: 8,
  },
  resultRef: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  resultArabic: {
    fontSize: 18,
    fontFamily: "Amiri_400Regular",
    textAlign: "right",
    lineHeight: 32,
    marginBottom: 8,
  },
  resultEnglish: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 10,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  emptyHint: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
