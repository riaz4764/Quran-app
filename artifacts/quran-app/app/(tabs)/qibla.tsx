import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useQibla } from "@/hooks/useQibla";
import { bearingToCardinal } from "@/utils/qibla";

const COMPASS_SIZE = 280;
const NEEDLE_LENGTH = 100;

function CompassNeedle({ angle }: { angle: number }) {
  const colors = useColors();
  const animAngle = useRef(new Animated.Value(angle)).current;
  const prevAngle = useRef(angle);

  useEffect(() => {
    const cur = prevAngle.current;
    let diff = ((angle - cur + 540) % 360) - 180;
    const next = cur + diff;
    prevAngle.current = next;
    Animated.timing(animAngle, {
      toValue: next,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [angle]);

  const rotate = animAngle.interpolate({
    inputRange: [-7200, 7200],
    outputRange: ["-7200deg", "7200deg"],
  });

  return (
    <Animated.View
      style={[
        styles.needleContainer,
        { transform: [{ rotate }] },
      ]}
    >
      <View style={styles.needleTip}>
        <Text style={styles.kaabaEmoji}>🕋</Text>
      </View>
      <View style={[styles.needleTop, { backgroundColor: colors.gold }]} />
      <View style={[styles.needlePivot, { backgroundColor: colors.gold, borderColor: colors.background }]} />
      <View style={[styles.needleBottom, { backgroundColor: colors.surface }]} />
    </Animated.View>
  );
}

function CompassRing() {
  const colors = useColors();
  const cardinals = [
    { label: "N", angle: 0 },
    { label: "E", angle: 90 },
    { label: "S", angle: 180 },
    { label: "W", angle: 270 },
  ];
  const R = COMPASS_SIZE / 2;

  return (
    <View style={[styles.compassRing, { borderColor: colors.border }]}>
      {cardinals.map(({ label, angle }) => {
        const rad = ((angle - 90) * Math.PI) / 180;
        const r = R - 22;
        const x = R + r * Math.cos(rad);
        const y = R + r * Math.sin(rad);
        return (
          <Text
            key={label}
            style={[
              styles.cardinal,
              {
                color: label === "N" ? colors.gold : colors.mutedForeground,
                position: "absolute",
                left: x - 10,
                top: y - 12,
              },
            ]}
          >
            {label}
          </Text>
        );
      })}
      {Array.from({ length: 36 }, (_, i) => {
        const a = i * 10;
        const rad = ((a - 90) * Math.PI) / 180;
        const isMajor = a % 90 === 0;
        const tickLen = isMajor ? 14 : a % 30 === 0 ? 10 : 6;
        const r1 = R - 36;
        const r2 = r1 - tickLen;
        const x1 = R + r1 * Math.cos(rad);
        const y1 = R + r1 * Math.sin(rad);
        const x2 = R + r2 * Math.cos(rad);
        const y2 = R + r2 * Math.sin(rad);
        return (
          <View
            key={a}
            style={{
              position: "absolute",
              left: x2,
              top: y2,
              width: x1 - x2 || 1,
              height: y1 - y2 || 1,
              backgroundColor: isMajor ? colors.gold : colors.border,
            }}
          />
        );
      })}
    </View>
  );
}

export default function QiblaScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const qibla = useQibla();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.arabicText }]}>
          اتِّجَاهُ الْقِبْلَةِ
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Qibla Direction
        </Text>
      </View>

      <View style={styles.body}>
        {qibla.status === "idle" || qibla.status === "requesting" ? (
          <StatusCard
            icon="📍"
            title="Requesting permission…"
            subtitle="Allow location access to find Qibla direction"
            colors={colors}
          />
        ) : qibla.status === "locating" ? (
          <StatusCard
            icon="🌍"
            title="Getting your location…"
            subtitle="This takes a few seconds"
            colors={colors}
          />
        ) : qibla.status === "denied" ? (
          <StatusCard
            icon="🚫"
            title="Location access denied"
            subtitle="Please enable location permission in your phone settings"
            colors={colors}
          />
        ) : qibla.status === "error" ? (
          <StatusCard
            icon="⚠️"
            title="Could not start compass"
            subtitle={qibla.message}
            colors={colors}
          />
        ) : (
          <>
            <View style={styles.compassWrapper}>
              <View
                style={[
                  styles.compassOuter,
                  { borderColor: colors.border, backgroundColor: colors.surface },
                ]}
              >
                <CompassRing />
                <CompassNeedle angle={qibla.arrowAngle} />
              </View>
            </View>

            <View
              style={[
                styles.infoCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.infoRow}>
                <View style={styles.infoBlock}>
                  <Text style={[styles.infoValue, { color: colors.gold }]}>
                    {Math.round(qibla.qiblaBearing)}°
                  </Text>
                  <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>
                    Qibla Bearing
                  </Text>
                </View>
                <View
                  style={[styles.infoDivider, { backgroundColor: colors.border }]}
                />
                <View style={styles.infoBlock}>
                  <Text style={[styles.infoValue, { color: colors.arabicText }]}>
                    {bearingToCardinal(qibla.qiblaBearing)}
                  </Text>
                  <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>
                    Direction
                  </Text>
                </View>
                <View
                  style={[styles.infoDivider, { backgroundColor: colors.border }]}
                />
                <View style={styles.infoBlock}>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {Math.round(qibla.heading)}°
                  </Text>
                  <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>
                    Heading
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={[
                styles.coordCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.coordText, { color: colors.mutedForeground }]}>
                📍 {qibla.lat.toFixed(4)}°N, {qibla.lng.toFixed(4)}°E
              </Text>
              <Text style={[styles.meccaText, { color: colors.mutedForeground }]}>
                🕋 Mecca: 21.4225°N, 39.8262°E
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

function StatusCard({
  icon,
  title,
  subtitle,
  colors,
}: {
  icon: string;
  title: string;
  subtitle: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View
      style={[
        styles.statusCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={styles.statusIcon}>{icon}</Text>
      <Text style={[styles.statusTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.statusSubtitle, { color: colors.mutedForeground }]}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: "center",
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontFamily: "Amiri_400Regular",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 20,
  },
  compassWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  compassOuter: {
    width: COMPASS_SIZE + 20,
    height: COMPASS_SIZE + 20,
    borderRadius: (COMPASS_SIZE + 20) / 2,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  compassRing: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    borderRadius: COMPASS_SIZE / 2,
    borderWidth: 1,
    position: "absolute",
  },
  cardinal: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    width: 20,
    textAlign: "center",
  },
  needleContainer: {
    width: NEEDLE_LENGTH * 2,
    height: NEEDLE_LENGTH * 2,
    alignItems: "center",
    justifyContent: "center",
  },
  needleTip: {
    position: "absolute",
    top: 0,
    alignItems: "center",
  },
  kaabaEmoji: {
    fontSize: 22,
  },
  needleTop: {
    position: "absolute",
    top: NEEDLE_LENGTH * 2 / 2 - NEEDLE_LENGTH + 24,
    width: 4,
    height: NEEDLE_LENGTH - 24,
    borderRadius: 2,
  },
  needlePivot: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  needleBottom: {
    position: "absolute",
    top: NEEDLE_LENGTH * 2 / 2 + 7,
    width: 4,
    height: NEEDLE_LENGTH - 10,
    borderRadius: 2,
  },
  infoCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  infoBlock: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  infoDivider: {
    width: 1,
    height: 40,
  },
  infoValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  infoLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  coordCard: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 4,
  },
  coordText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  meccaText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  statusCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
    gap: 10,
  },
  statusIcon: {
    fontSize: 40,
    marginBottom: 6,
  },
  statusTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  statusSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
});
