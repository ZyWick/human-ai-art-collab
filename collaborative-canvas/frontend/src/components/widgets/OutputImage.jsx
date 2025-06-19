import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setImageZoom } from "../../redux/roomSlice";

const OutputImage = ({
  image,
  prompt,
  className = "the-row-image",
  style = {},
}) => {
  const showOutputColors = useSelector((state) => state.room.showOutputColors);
  const dispatch = useDispatch();

  const insertColorInFilename = (url) => url.replace(/(\.[^/.]+)$/, "_color$1");

  const [hovered, setHovered] = useState(false);
  const [toggleColor, setToggleColor] = useState(false);

  useEffect(() => {
    setToggleColor(false);
  }, [showOutputColors]);

  // Cache both versions of the image
  const originalSrc = image;
  const colorSrc = useMemo(() => insertColorInFilename(image), [image]);

  const shouldInsertColor = showOutputColors ? toggleColor : false;
  const finalSrc = shouldInsertColor ? colorSrc : originalSrc;

  const defaultStyle = {
    maxHeight: "17.5vh",
    width: "100%",
    objectFit: "contain",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.25)",
    borderRadius: "8px",
    ...style,
  };

  const wrapperStyle = {
    position: "relative",
    display: "inline-block",
    width: "fit-content",
    height: "fit-content",
  };

  const buttonStyle = {
    position: "absolute",
    top: "8px",
    right: "8px",
    width: "1.5em",
    height: "1.5em",
    borderRadius: "50%",
    border: "none",
    color: "#fff",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.7,
  };

  return (
    <div
      style={wrapperStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={finalSrc}
        onClick={() => dispatch(setImageZoom(finalSrc))}
        className={className}
        alt={prompt}
        title={prompt}
        style={className === "imageResult" ? defaultStyle : undefined}
      />
      {hovered && showOutputColors && (
        <button
          style={{
            ...buttonStyle,
            background: "transparent",
          }}
          title="Toggle Color"
          onClick={(e) => {
            e.stopPropagation();
            setToggleColor((prev) => !prev);
          }}
        >
          <img
            src={
              shouldInsertColor ? "/icons/bwWheel.svg" : "/icons/colorWheel.svg"
            }
            alt="Home"
            style={{
              width: shouldInsertColor ? "16px" : "24px",
              height: shouldInsertColor ? "16px" : "24px",
            }}
          />
        </button>
      )}
    </div>
  );
};

export default OutputImage;
