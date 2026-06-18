import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { calcQiblaBearing } from "@/utils/qibla";

const CACHE_KEY = "qibla_cached_location";

interface CachedLocation {
  lat: number;
  lng: number;
  savedAt: number;
}

async function loadCachedLocation(): Promise<CachedLocation | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function saveLocation(lat: number, lng: number): Promise<void> {
  try {
    const payload: CachedLocation = { lat, lng, savedAt: Date.now() };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {}
}

export type QiblaState =
  | { status: "idle" }
  | { status: "requesting" }
  | { status: "denied" }
  | { status: "locating" }
  | {
      status: "ready";
      qiblaBearing: number;
      heading: number;
      arrowAngle: number;
      lat: number;
      lng: number;
      locationSource: "live" | "cached";
    }
  | { status: "error"; message: string };

export function useQibla(): QiblaState {
  const [state, setState] = useState<QiblaState>({ status: "idle" });
  const headingSubRef = useRef<Location.LocationSubscription | null>(null);
  const qiblaRef = useRef<number>(0);
  const latRef = useRef<number>(0);
  const lngRef = useRef<number>(0);
  const sourceRef = useRef<"live" | "cached">("live");

  function startHeadingWatch(
    lat: number,
    lng: number,
    source: "live" | "cached"
  ) {
    latRef.current = lat;
    lngRef.current = lng;
    sourceRef.current = source;
    const qibla = calcQiblaBearing(lat, lng);
    qiblaRef.current = qibla;

    Location.watchHeadingAsync((h) => {
      const heading = h.magHeading;
      const arrowAngle = ((qiblaRef.current - heading) + 360) % 360;
      setState({
        status: "ready",
        qiblaBearing: qiblaRef.current,
        heading,
        arrowAngle,
        lat: latRef.current,
        lng: lngRef.current,
        locationSource: sourceRef.current,
      });
    }).then((sub) => {
      headingSubRef.current = sub;
    });
  }

  useEffect(() => {
    if (Platform.OS === "web") {
      setState({
        status: "error",
        message:
          "Compass is not supported in the browser.\nUse the Expo Go app on your phone.",
      });
      return;
    }

    let cancelled = false;

    async function start() {
      setState({ status: "requesting" });

      // Load cached location immediately — can start heading even if GPS is off
      const cached = await loadCachedLocation();

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;

      if (status !== "granted") {
        if (cached) {
          // Permission denied but we have cached coords — use them
          if (!cancelled) startHeadingWatch(cached.lat, cached.lng, "cached");
        } else {
          setState({ status: "denied" });
        }
        return;
      }

      // Permission granted — try to get live GPS
      setState({ status: "locating" });

      // If we have cached location, start compass immediately while GPS loads
      if (cached && !cancelled) {
        startHeadingWatch(cached.lat, cached.lng, "cached");
      }

      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled) return;
        const { latitude: lat, longitude: lng } = loc.coords;
        await saveLocation(lat, lng);
        if (!cancelled) startHeadingWatch(lat, lng, "live");
      } catch {
        // GPS failed — if we already started with cache, it's fine
        if (!cached && !cancelled) {
          setState({
            status: "error",
            message:
              "GPS is off and no saved location found.\nTurn on GPS once to save your location.",
          });
        }
        // else: already running on cached coords — no change needed
      }
    }

    start();

    return () => {
      cancelled = true;
      headingSubRef.current?.remove();
    };
  }, []);

  return state;
}
