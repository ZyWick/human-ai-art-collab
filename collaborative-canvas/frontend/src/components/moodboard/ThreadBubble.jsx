import React from "react";
import { Circle, Text, Group } from "react-konva";

const ThreadBubble = ({ thread, position,  ref, onMouseEnter, onMouseLeave, onClick }) => {
  return (
    <Group
      x={position.x}
      y={position.y}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      ref={ref}
    >
      <Circle radius={15} fill="lightblue" />
      <Text
        text={thread.username?.charAt(0).toUpperCase()}
        fontSize={16}
        fill="white"
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
