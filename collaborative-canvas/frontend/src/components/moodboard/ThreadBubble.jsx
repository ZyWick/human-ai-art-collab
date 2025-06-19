import React from "react";
import { Circle, Text, Group } from "react-konva";
import { getUserColor, getContrastTextColor } from "../../util/userColor";

const ThreadBubble = ({
  thread,
  position,
  forwardRef,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) => {
  // Memoized function to get user color
  const bgColor = getUserColor(thread.userId);
  const textColor = getContrastTextColor(bgColor);

  return (
    <Group
      x={position.x}
      y={position.y}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      ref={forwardRef}
    >
      <Circle radius={15} fill={bgColor} />
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
