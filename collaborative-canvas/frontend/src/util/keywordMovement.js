export const calculateNewKeywordPosition = (
  newX,
  newY,
  targetWidth,
  targetHeight,
  imageBoundsWidth,
  imageBoundsHeight
) => {
  if (!imageBoundsWidth || !imageBoundsHeight) return { newX, newY };

  let maxRadius = Math.max(imageBoundsWidth, imageBoundsHeight) * 1.5;
  let imageCenter = { x: imageBoundsWidth / 2, y: imageBoundsHeight / 2 };
  let keywordCenter = {
    x: newX + targetWidth / 2,
    y: newY + targetHeight / 2,
  };

  let deltaX = imageCenter.x - keywordCenter.x;
  let deltaY = imageCenter.y - keywordCenter.y;
  let distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
  let moveHorizontally = Math.abs(deltaX) >= Math.abs(deltaY);

  if (
    distance < imageBoundsWidth / 2 + targetWidth / 2 &&
    distance < imageBoundsHeight / 2 + targetHeight / 2
  ) {
    newX = moveHorizontally
      ? deltaX < 0
        ? imageBoundsWidth + 20
        : -20 - targetWidth
      : newX;

    newY = !moveHorizontally
      ? deltaY < 0
        ? imageBoundsHeight + targetHeight
        : -targetHeight
      : newY;
  } else if (distance > maxRadius) {
    let angle = Math.atan2(deltaY, deltaX);
    newX = imageCenter.x + Math.cos(angle) * maxRadius * -1 - targetWidth / 2;
    newY = imageCenter.y + Math.sin(angle) * maxRadius * -1 - targetHeight / 2;
  }

  return { newX, newY };
};

// export const handleKeywordPositionUpdate = (
//   keywordId,
//   newOffsetX,
//   newOffsetY,
//   targetWidth,
//   targetHeight,
//   target2Width,
//   target2Height,
//   updateKeywordPosition
// ) => {
//   const adjustedOffset = calculateNewKeywordPosition(
//     newOffsetX,
//     newOffsetY,
//     targetWidth,
//     targetHeight,
//     target2Width,
//     target2Height
//   );

//   updateKeywordPosition({
//     _id: keywordId,
//     offsetX: adjustedOffset.newX,
//     offsetY: adjustedOffset.newY,
//   });

//   return  {
//     newX: adjustedOffset.newX,
//     newY: adjustedOffset.newY,
//   };

//   // socket.emit("updateKeywordPosition", {
//   //   ...data,
//   //   offsetX: adjustedOffset.newX,
//   //   offsetY: adjustedOffset.newY,
//   // });
// };
