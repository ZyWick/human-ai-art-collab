import React, { useMemo } from "react";
import { Circle, Text, Group } from "react-konva";

const ThreadBubble = ({ thread, position, forwardRef, onMouseEnter, onMouseLeave, onClick }) => {
  
  // Memoized function to get user color
  const colorAssigned = useMemo(() => {
    let userId = thread.userId;
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    let hue = Math.abs(hash) % 360; // Ensures color variety
    return `hsl(${hue}, 70%, 50%)`; // Keeps saturation and lightness consistent
  }, [thread.userId]);

  // Function to determine contrasting text color
  function getContrastTextColor(bgColor) {
    // Convert HSL to RGB for luminance calculation
    const hslToRgb = (h, s, l) => {
      s /= 100;
      l /= 100;
      const k = n => (n + h / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
      return [f(0) * 255, f(8) * 255, f(4) * 255];
    };

    const hslMatch = bgColor.match(/\d+/g);
    if (!hslMatch) return "#FFF"; // Default to white if parsing fails

    const [h, s, l] = hslMatch.map(Number);
    const [r, g, b] = hslToRgb(h, s, l);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000" : "#FFF"; // Black text if bright, white if dark
  }

  const textColor = getContrastTextColor(colorAssigned);

  return (
    <Group
      x={position.x}
      y={position.y}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      ref={forwardRef}
    >
      <Circle radius={15} fill={colorAssigned} />
      <Text
        text={thread.username?.charAt(0).toUpperCase()}
        fontSize={16}
        fill={textColor}
        align="center"
        verticalAlign="middle"
        width={40}
        height={40}
        offsetX={20}
        offsetY={17}
      />
    </Group>
  );
};

export default ThreadBubble;
