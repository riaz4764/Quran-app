import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQuranSettings } from "@/context/QuranContext";
import { useColors } from "@/hooks/useColors";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useQuranSettings();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 100),
      }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.gold }]}>
          TRANSLATIONS
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow
            label="English (Hilali-Khan)"
            colors={colors}
          >
            <Switch
              value={settings.showEnglish}
              onValueChange={(v) => updateSettings({ showEnglish: v })}
              trackColor={{ false: colors.muted, true: colors.gold }}
              thumbColor="#fff"
            />
          </SettingRow>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow label="Urdu (Jalandhry)" colors={colors}>
            <Switch
              value={settings.showUrdu}
              onValueChange={(v) => updateSettings({ showUrdu: v })}
              trackColor={{ false: colors.muted, true: colors.gold }}
              thumbColor="#fff"
            />
          </SettingRow>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.gold }]}>
          FONT SIZE
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.fontRow}>
            <Text style={[styles.fontLabel, { color: colors.text }]}>
              Arabic Font
            </Text>
            <View style={styles.counter}>
              <Pressable
                onPress={() =>
                  updateSettings({
                    arabicFontSize: Math.max(18, settings.arabicFontSize - 2),
                  })
                }
                style={[styles.counterBtn, { backgroundColor: colors.surface }]}
                hitSlop={4}
              >
                <Feather name="minus" size={16} color={colors.gold} />
              </Pressable>
              <Text style={[styles.counterVal, { color: colors.text }]}>
                {settings.arabicFontSize}
              </Text>
              <Pressable
                onPress={() =>
                  updateSettings({
                    arabicFontSize: Math.min(48, settings.arabicFontSize + 2),
                  })
                }
                style={[styles.counterBtn, { backgroundColor: colors.surface }]}
                hitSlop={4}
              >
                <Feather name="plus" size={16} color={colors.gold} />
              </Pressable>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.fontRow}>
            <Text style={[styles.fontLabel, { color: colors.text }]}>
              Translation Font
            </Text>
            <View style={styles.counter}>
              <Pressable
                onPress={() =>
                  updateSettings({
                    translationFontSize: Math.max(11, settings.translationFontSize - 1),
                  })
                }
                style={[styles.counterBtn, { backgroundColor: colors.surface }]}
                hitSlop={4}
              >
                <Feather name="minus" size={16} color={colors.gold} />
              </Pressable>
              <Text style={[styles.counterVal, { color: colors.text }]}>
                {settings.translationFontSize}
              </Text>
              <Pressable
                onPress={() =>
                  updateSettings({
                    translationFontSize: Math.min(22, settings.translationFontSize + 1),
                  })
                }
                style={[styles.counterBtn, { backgroundColor: colors.surface }]}
                hitSlop={4}
              >
                <Feather name="plus" size={16} color={colors.gold} />
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.gold }]}>
          PREVIEW
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.previewArabic, { color: colors.arabicText, fontSize: settings.arabicFontSize }]}>
            قُلْ هُوَ اللَّهُ أَحَدٌ
          </Text>
          {settings.showEnglish && (
            <Text style={[styles.previewTranslation, { color: colors.englishText, fontSize: settings.translationFontSize }]}>
              Say: He is Allah, the One
            </Text>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
          Arabic: Uthmani Hafs · English: Hilali-Khan
        </Text>
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
          Urdu: Jalandhry · Data: alquran.cloud
        </Text>
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
          100% Offline · No Ads · No Tracking
        </Text>
      </View>
    </ScrollView>
  );
}

function SettingRow({
  label,
  children,
  colors,
}: {
  label: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.settingRow}>
      <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingLabel: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  fontRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  fontLabel: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  counterVal: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    width: 32,
    textAlign: "center",
  },
  previewArabic: {
    fontFamily: "Amiri_400Regular",
    textAlign: "right",
    paddingHorizontal: 16,
    paddingTop: 16,
    lineHeight: 52,
  },
  previewTranslation: {
    fontFamily: "Inter_400Regular",
    paddingHorizontal: 16,
    paddingBottom: 16,
    lineHeight: 22,
  },
  footer: {
    marginTop: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
