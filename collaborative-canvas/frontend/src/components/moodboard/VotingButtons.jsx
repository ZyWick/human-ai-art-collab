import React, { useState, useEffect, useCallback } from "react";
import { Group, Rect, Text } from "react-konva";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import colorMapping from "../../config/keywordTypes";

const VotingButtons = ({ _id, kwVotes, kwDownvotes, type, xpos, ypos }) => {
  const socket = useSocket();
  const { user } = useAuth();
  const [hovered, setHovered] = useState(null);
  const [votes, setVotes] = useState(kwVotes || []);
  const [downvotes, setDownvotes] = useState(kwDownvotes || []);

  const isVotedByUser = votes?.includes(user.id);
  const isDownvotedByUser = downvotes?.includes(user.id);
  const votesNumber = (votes?.length || 0) - (downvotes?.length || 0);

  useEffect(() => setVotes(kwVotes || []), [kwVotes]);
  useEffect(() => setDownvotes(kwDownvotes || []), [kwDownvotes]);

  const handleVoteClick = useCallback(
    (e, action) => {
      e.cancelBubble = true;

      const updatedVotes = new Set(votes);
      const updatedDownvotes = new Set(downvotes);
      let actualAction = action;

      if (action === "upvote") {
        if (updatedVotes.has(user.id)) {
          updatedVotes.delete(user.id);
          actualAction = "remove";
        } else {
          updatedVotes.add(user.id);
          updatedDownvotes.delete(user.id);
        }
      } else if (action === "downvote") {
        if (updatedDownvotes.has(user.id)) {
          updatedDownvotes.delete(user.id);
          actualAction = "remove";
        } else {
          updatedDownvotes.add(user.id);
          updatedVotes.delete(user.id);
        }
      }

      setVotes([...updatedVotes]);
      setDownvotes([...updatedDownvotes]);
      socket.emit("updateKeywordVotes", {
        keywordId: _id,
        userId: user.id,
        action: actualAction,
      });
    },
    [votes, downvotes, socket, _id, user.id]
  );

  const handleMouseEnter = (e, type) => {
    e.target.getStage().container().style.cursor = "pointer";
    setHovered(type);
  };

  const handleMouseLeave = (e) => {
    e.target.getStage().container().style.cursor = "default";
    setHovered(null);
  };

  return (
    <Group x={xpos} y={ypos}>
      {["upvote", "downvote"].map((action, index) => {
        const isActioned =
          action === "upvote" ? isVotedByUser : isDownvotedByUser;
        const width = action === "upvote" ? 35 : 20;
        const text = action === "upvote" ? `👍 ${votesNumber}` : "👎";
        return (
          <Group
            key={action}
            x={index * 40}
            onClick={(e) => handleVoteClick(e, action)}
            onMouseEnter={(e) => handleMouseEnter(e, action)}
            onMouseLeave={handleMouseLeave}
          >
            <Rect
              width={width}
              height={20}
              fill={isActioned ? colorMapping[type] : "transparent"}
              cornerRadius={5}
              stroke={colorMapping[type]}
              strokeWidth={0.5}
              shadowColor={
                hovered === action ? colorMapping[type] : "transparent"
              }
              shadowBlur={hovered === action ? 3 : 0}
              shadowOpacity={hovered === action ? 2 : 0}
            />
            <Text
              text={text}
              fontSize={10}
              fill={isActioned ? "white" : colorMapping[type]}
              align="center"
              width={width}
              height={20}
              verticalAlign="middle"
            />
          </Group>
        );
      })}
    </Group>
  );
};

export default VotingButtons;
