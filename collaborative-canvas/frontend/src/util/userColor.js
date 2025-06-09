// utils/userColor.js
export function getUserColor(userId) {
  if (!userId) return 'hsl(0, 0%, 0%)';
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  let hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

export function getContrastTextColor(bgColor) {
  const hslToRgb = (h, s, l) => {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return [f(0) * 255, f(8) * 255, f(4) * 255];
  };

  const hslMatch = bgColor.match(/\d+/g);
  if (!hslMatch) return "#FFF";

  const [h, s, l] = hslMatch.map(Number);
  const [r, g, b] = hslToRgb(h, s, l);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000" : "#FFF";
}
