const MECCA_LAT = 21.4225;
const MECCA_LNG = 39.8262;

export function calcQiblaBearing(userLat: number, userLng: number): number {
  const lat1 = (userLat * Math.PI) / 180;
  const lat2 = (MECCA_LAT * Math.PI) / 180;
  const dLng = ((MECCA_LNG - userLng) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export function bearingToCardinal(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

export function shortestAngle(from: number, to: number): number {
  const diff = ((to - from + 540) % 360) - 180;
  return from + diff;
}
