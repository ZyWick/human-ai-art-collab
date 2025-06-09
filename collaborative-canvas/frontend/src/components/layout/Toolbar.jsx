import React, { useCallback, useMemo, useEffect, useRef } from "react";
import { debounce } from "lodash";
import _ from "lodash";
import { useSelector } from "react-redux";
import useDispatchWithMeta from "../../hook/useDispatchWithMeta";
import useRandomStageCoordinates from "../../hook/useRandomStageCoordinates";
import { useSocket } from "../../context/SocketContext";
import { selectBoardById, updateBoard } from "../../redux/boardsSlice";
import { selectAllKeywords } from "../../redux/keywordsSlice";
import { KeywordButton } from "../widgets/KeywordButton";
import "../../assets/styles/toolbar.css";
import "../../assets/styles/kwButton.css";

const DEBOUNCE_DELAY = 5000;
const summarizeKeywords = (list) =>
  _.sortBy(
    list
      .filter(
        ({ type, offsetX, offsetY }) =>
          type !== "Arrangement" &&
          offsetX !== undefined &&
          offsetY !== undefined
      )
      .map(({ _id, keyword, type, votes = [], downvotes = [] }) => ({
        _id,
        keyword,
        type,
        votes: votes.length - downvotes.length,
      })),
    "_id"
  );

const normalizeType = (type) => {
  const map = {
    "subject matter": "Subject matter",
    "action & pose": "Action & pose",
    "theme & mood": "Theme & mood",
  };
  return map[type.trim().toLowerCase()];
};

const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

const Toolbar = ({ stageRef }) => {
  const socket = useSocket();
  const dispatch = useDispatchWithMeta();
  const getRandomCoordinates = useRandomStageCoordinates(stageRef);

  const boardId = useSelector((state) => state.room.currentBoardId);
  const currBoard = useSelector((state) => selectBoardById(state, boardId));

  // const selectedKeywordIds = useSelector(
  //   (state) => state.selection.selectedKeywordIds
  // );
  const designDetails = useSelector((state) => state.room.designDetails);
  const keywords = useSelector(selectAllKeywords);

  const summarizedKeywords = summarizeKeywords(keywords);
  const prevBoard = usePrevious(summarizedKeywords);

  const processKeywords = useCallback((keywords, brief) => {
    const result = {
      "Subject matter": {},
      "Action & pose": {},
      "Theme & mood": {},
      Brief: brief,
    };

    keywords.forEach(({ type, keyword, votes }) => {
      const normalized = normalizeType(type);
      if (normalized) {
        result[normalized][keyword.trim()] = votes;
      }
    });

    return result;
  }, []);

  const debouncedEmitBoardKw = useMemo(
    () =>
      debounce((keywords) => {
        const data = processKeywords(keywords, designDetails.objective);
        socket.emit("recommendFromBoardKw", { boardId, data });
      }, DEBOUNCE_DELAY),
    [socket, boardId, designDetails.objective, processKeywords]
  );

  useEffect(() => {
    if (summarizedKeywords.length > 0 && !_.isEqual(prevBoard, summarizedKeywords)) {
      debouncedEmitBoardKw(summarizedKeywords);
      console.log(summarizedKeywords)
    }
  }, [summarizedKeywords, prevBoard, debouncedEmitBoardKw]);

  useEffect(() => {
    return () => {
      debouncedEmitBoardKw.cancel();
    };
  }, [debouncedEmitBoardKw]);

  // const debouncedEmitSelectedKw = useMemo(() =>
  //   debounce((keywords) => {
  //     const data = processKeywords(keywords, designDetails.objective);
  //     socket.emit("recommendFromSelectedKw", { boardId, data });
  //   }, DEBOUNCE_DELAY),
  //   [socket, boardId, designDetails.objective, processKeywords]
  // );




  // Selected keywords effect
  // const selectedSummarized = summarizeKeywords(
  //   keywords.filter((kw) => selectedKeywordIds.includes(kw._id))
  // );

  // const prevSelected = usePrevious(selectedSummarized);

  // useEffect(() => {
  //   if (!_.isEqual(prevSelected, selectedSummarized)) {
  //     debouncedEmitSelectedKw(selectedSummarized);
  //   }
  // }, [selectedSummarized, prevSelected, debouncedEmitSelectedKw]);

  const addKeywordSelection = useCallback(
    (type, newKeywordText) => {
      const { x, y } = getRandomCoordinates();
      socket.emit("newKeyword", {
        boardId,
        type,
        keyword: newKeywordText,
        offsetX: x,
        offsetY: y,
      });
    },
    [boardId, socket, getRandomCoordinates]
  );

  let { BroadRecommendedKeywords = [], SpecificRecommendedKeywords = [] } =
    currBoard || {};

  const handleClickRecomKw = useCallback(
    (from, keyword, type) => {
      addKeywordSelection(type, keyword);

      const sourceKeywords =
        from === "Broad"
          ? BroadRecommendedKeywords
          : SpecificRecommendedKeywords;

      const updatedKeywords = {
        ...sourceKeywords,
        [type]: sourceKeywords[type]?.filter((k) => k !== keyword) || [],
      };

      dispatch(updateBoard, {
        id: boardId,
        changes: { [`${from}RecommendedKeywords`]: updatedKeywords },
      });
    },
    [
      dispatch,
      boardId,
      addKeywordSelection,
      BroadRecommendedKeywords,
      SpecificRecommendedKeywords,
    ]
  );

  return (
    <>
      <div
        className="toolbar"
        style={{ boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.25)" }}
      >
        <div
          className="toolbar-group"
          style={{
            maxHeight: "100%",
            width: "20vw",
            gap: "0.3em",
            flexDirection: "column",
          }}
        >
          <span style={{ fontSize: "0.7em", color: "grey" }}>Go Broad</span>
          <div
            className="scrollable-container"
            style={{
              maxHeight: "5%",
              display: "flex",
              justifyContent: "center",
              overflowX: "auto",
              flexWrap: "wrap",
              gap: "0.1em",
              fontSize: "20px",
            }}
          >
            {BroadRecommendedKeywords &&
              Object.entries(BroadRecommendedKeywords).map(([type, keywords]) =>
                keywords.map((keyword, i) => (
                  <KeywordButton
                  className="keyword-button"
                    key={`${type}-${i}`}
                    text={keyword}
                    type={type}
                    fontSize="12px"
                    onClick={() => {
                      handleClickRecomKw("Broad", keyword, type);
                    }}
                  />
                ))
              )}
          </div>
        </div>
        <div
          style={{
            height: "90%",
            width: "1px",
            backgroundColor: "#ccc",
          }}
        />
        {/* Iterations Toggle */}
        <div
          className="toolbar-group"
          style={{
            maxHeight: "100%",
            width: "20vw",
            gap: "0.3em",
            flexDirection: "column",
          }}
        >
          <span style={{ fontSize: "0.7em", color: "grey" }}>Get Specific</span>
          <div
            className="scrollable-container"
            style={{
              maxHeight: "5%",
              display: "flex",
              justifyContent: "center",
              overflowX: "auto",
              flexWrap: "wrap",
              gap: "0.1em",
              fontSize: "20px",
            }}
          >
            {SpecificRecommendedKeywords &&
              Object.entries(SpecificRecommendedKeywords).map(
                ([type, keywords]) =>
                  keywords.map((keyword, i) => (
                    <KeywordButton
                      className="keyword-button"
                    key={`${type}-${i}`}
                    text={keyword}
                    type={type}
                    fontSize="12px"
                      onClick={() => {
                        handleClickRecomKw("Specific", keyword, type);
                      }}
                    />
                  ))
              )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Toolbar;
