import { calculateNewKeywordPosition } from "../util/keywordMovement";

describe('calculateNewKeywordPosition', () => {
  const targetWidth = 20;
  const targetHeight = 20;
  const imageBoundsWidth = 100;
  const imageBoundsHeight = 100;
  const imageCenterX = imageBoundsWidth / 2; // 50
  const imageCenterY = imageBoundsHeight / 2; // 50

  test('returns original position when image dimensions are falsy', () => {
    const result1 = calculateNewKeywordPosition(50, 50, targetWidth, targetHeight, 0, imageBoundsHeight);
    expect(result1).toEqual({ offsetX: 50, offsetY: 50 });

    const result2 = calculateNewKeywordPosition(50, 50, targetWidth, targetHeight, imageBoundsWidth, 0);
    expect(result2).toEqual({ offsetX: 50, offsetY: 50 });
  });

  describe('when keyword is within image bounds (inside the effective radius)', () => {
    test('should reposition horizontally when deltaX < 0 (dragged right)', () => {
      // Choose newX so that keyword center is to the right of the image center.
      // For instance, newX = 70 gives keywordCenter.x = 70 + targetWidth/2 = 80, so deltaX = 50 - 80 = -30.
      const newX = 70;
      const newY = 40; // arbitrary y that keeps vertical difference minimal
      const result = calculateNewKeywordPosition(newX, newY, targetWidth, targetHeight, imageBoundsWidth, imageBoundsHeight);
      // When deltaX < 0 and horizontal move, newX should be set to imageBoundsWidth + 20.
      expect(result.offsetX).toBe(imageBoundsWidth + 20);
      // newY remains unchanged.
      expect(result.offsetY).toBe(newY);
    });

    test('should reposition horizontally when deltaX >= 0 (dragged left)', () => {
      // Choose newX so that keyword center is to the left of the image center.
      // For example, newX = 20 gives keywordCenter.x = 20 + 10 = 30, so deltaX = 50 - 30 = 20.
      const newX = 20;
      const newY = 40; // arbitrary y
      const result = calculateNewKeywordPosition(newX, newY, targetWidth, targetHeight, imageBoundsWidth, imageBoundsHeight);
      // When deltaX >= 0 and horizontal move, newX should be set to -20 - targetWidth.
      expect(result.offsetX).toBe(-20 - targetWidth);
      // newY remains unchanged.
      expect(result.offsetY).toBe(newY);
    });

    test('should reposition vertically when deltaY < 0 (dragged down)', () => {
      // Make vertical difference dominate. newY = 70 gives keywordCenter.y = 70 + 10 = 80, so deltaY = 50 - 80 = -30.
      const newX = 40; // arbitrary x so that vertical dominates (|deltaY| > |deltaX|)
      const newY = 70;
      const result = calculateNewKeywordPosition(newX, newY, targetWidth, targetHeight, imageBoundsWidth, imageBoundsHeight);
      // When vertical move and deltaY < 0, newY should be set to imageBoundsHeight + targetHeight.
      expect(result.offsetY).toBe(imageBoundsHeight + targetHeight);
      // newX remains unchanged.
      expect(result.offsetX).toBe(newX);
    });

    test('should reposition vertically when deltaY >= 0 (dragged up)', () => {
      // Make vertical difference dominate. newY = 20 gives keywordCenter.y = 20 + 10 = 30, so deltaY = 50 - 30 = 20.
      const newX = 40; // arbitrary x so that vertical dominates
      const newY = 20;
      const result = calculateNewKeywordPosition(newX, newY, targetWidth, targetHeight, imageBoundsWidth, imageBoundsHeight);
      // When vertical move and deltaY >= 0, newY should be set to -targetHeight.
      expect(result.offsetY).toBe(-targetHeight);
      // newX remains unchanged.
      expect(result.offsetX).toBe(newX);
    });
  });

  describe('when keyword is outside the maximum radius', () => {
    test('should reposition based on angle when distance > maxRadius', () => {
      // For image 100x100, maxRadius = 100 * 1.5 = 150.
      // Choose newX/newY far outside the image so that the keyword center is at a distance greater than 150.
      const newX = 300;
      const newY = 300;
      const result = calculateNewKeywordPosition(newX, newY, targetWidth, targetHeight, imageBoundsWidth, imageBoundsHeight);

      // Compute expected values based on the function:
      const maxRadius = Math.max(imageBoundsWidth, imageBoundsHeight) * 1.5; // 150
      const imageCenter = { x: imageCenterX, y: imageCenterY };
      const keywordCenter = { x: newX + targetWidth / 2, y: newY + targetHeight / 2 }; // (310,310)
      const deltaX = imageCenter.x - keywordCenter.x; // 50 - 310 = -260
      const deltaY = imageCenter.y - keywordCenter.y; // 50 - 310 = -260
      const angle = Math.atan2(deltaY, deltaX);
      // Calculate expected new positions:
      const expectedX = imageCenter.x + Math.cos(angle) * maxRadius * -1 - targetWidth / 2;
      const expectedY = imageCenter.y + Math.sin(angle) * maxRadius * -1 - targetHeight / 2;

      // Use toBeCloseTo for floating point comparisons.
      expect(result.offsetX).toBeCloseTo(expectedX);
      expect(result.offsetY).toBeCloseTo(expectedY);
    });
  });
});
