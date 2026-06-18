import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { calcQiblaBearing } from "@/utils/qibla";

export type QiblaState =
  | { status: "idle" }
  | { status: "requesting" }
  | { status: "denied" }
  | { status: "locating" }
  | { status: "ready"; qiblaBearing: number; heading: number; arrowAngle: number; lat: number; lng: number }
  | { status: "error"; message: string };

export function useQibla(): QiblaState {
  const [state, setState] = useState<QiblaState>({ status: "idle" });
  const headingSubRef = useRef<Location.LocationSubscription | null>(null);
  const qiblaRef = useRef<number>(0);

  useEffect(() => {
    if (Platform.OS === "web") {
      setState({ status: "error", message: "Compass is not supported in the browser.\nUse the Expo Go app on your phone." });
      return;
    }

    let cancelled = false;

    async function start() {
      setState({ status: "requesting" });

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (status !== "granted") {
        setState({ status: "denied" });
        return;
      }

      setState({ status: "locating" });
      let coords: Location.LocationObjectCoords;
      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        coords = loc.coords;
      } catch (e) {
        if (!cancelled) setState({ status: "error", message: "Could not get your location." });
        return;
      }
      if (cancelled) return;

      const qibla = calcQiblaBearing(coords.latitude, coords.longitude);
      qiblaRef.current = qibla;

      headingSubRef.current = await Location.watchHeadingAsync((h) => {
        if (cancelled) return;
        const heading = h.magHeading;
        const arrowAngle = ((qiblaRef.current - heading) + 360) % 360;
        setState({
          status: "ready",
          qiblaBearing: qiblaRef.current,
          heading,
          arrowAngle,
          lat: coords.latitude,
          lng: coords.longitude,
        });
      });
    }

    start();

    return () => {
      cancelled = true;
      headingSubRef.current?.remove();
    };
  }, []);

  return state;
}
