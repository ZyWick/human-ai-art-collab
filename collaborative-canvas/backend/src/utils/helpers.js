import _ from 'lodash';
import crypto from 'crypto';
import {updateNewImageAndPromptToIteration} from "../services/boardService.js";

import { generateLayout, matchLayout } from "./llm.js";
import {generateImage} from "./imageGeneration.js";
import {getTopFusedBoxes} from "./getBoundingBoxes.js";
import { withRetry } from './retry.js';

export function checkMeaningfulChanges(prev, curr) {
      const prevKeys = Object.keys(prev);
      const currKeys = Object.keys(curr);

      if (prevKeys.length !== currKeys.length) return true;

      for (const key of new Set([...prevKeys, ...currKeys])) {
        const prevVal = prev[key];
        const currVal = curr[key];

        if (typeof prevVal !== "object" || typeof currVal !== "object") {
          if (prevVal !== currVal) return true;
        } else {
          const subKeysPrev = Object.keys(prevVal);
          const subKeysCurr = Object.keys(currVal);

          if (subKeysPrev.length !== subKeysCurr.length) return true;

          for (const subKey of new Set([...subKeysPrev, ...subKeysCurr])) {
            if (prevVal[subKey] !== currVal[subKey]) return true;
          }
        }
      }

      return false;
    }

export function debounceBoardFunction(debounceMap, boardId, key, fn, delay) {
  if (!debounceMap[boardId]) {
    debounceMap[boardId] = {};
  }

  const boardEntry = debounceMap[boardId];

  if (!boardEntry[key]) {
    boardEntry[key] = {
      latestFn: fn,
      debounced: _.debounce(async () => {
        try {
          console.log(`[${boardId}:${key}] Debounced function executing`);
          await boardEntry[key].latestFn();
        } catch (err) {
          console.error(`[${boardId}:${key}] Error in debounced function:`, err);
        }
      }, delay),
    };
  } else {
    boardEntry[key].latestFn = fn;
  }

  console.log(`[${boardId}:${key}] Debounced function triggered`);
  boardEntry[key].debounced();
}

export function handleLeave(users, rooms, socket, io) {
  const user = users[socket.id];
  if (!user) return;

  const roomId = user.roomId;

  rooms[roomId] = rooms[roomId]?.filter((u) => u.id !== socket.id) || [];

  if (rooms[roomId]?.length === 0) {
    delete rooms[roomId];
  } else {
    const usernames = rooms[roomId].map((u) => ({
      userId: u.userId,
      username: u.username,
    }));
    io.to(roomId).emit("updateRoomUsers", usernames);
  }

  socket.leave(roomId);
  delete users[socket.id];
}

/**
 * Generate a secure join code.
 * @returns {string}
 */
export const generateCode = (slice) =>
  crypto.randomUUID().replace(/-/g, '').slice(0, slice).toUpperCase();


export function extractKeywords(data, arrangement = []) {
  const keywords = [];

  if (!data || typeof data !== 'object') {
    console.warn("extractKeywords: 'data' is missing or not an object.", data);
    return keywords;
  }

  // Extract keywords from the provided data object
  Object.entries(data).forEach(([type, entries]) => {
    if (entries && typeof entries === "object" && !Array.isArray(entries)) {
      Object.entries(entries).forEach(([keyword, vote]) => {
        keywords.push({ keyword, type, vote });
      });
    } else {
      if (type !== "brief")
      console.warn(`extractKeywords: Skipped type '${type}' with invalid entries.`, entries);
    }
  });

  // Add arrangement keywords if present
  if (Array.isArray(arrangement)) {
    arrangement.forEach(item => {
      if (item && typeof item === 'object' && 'votes' in item) {
        keywords.push({
          keyword: "Arrangement",
          type: "Arrangement",
          vote: item.votes
        });
      } else {
        console.warn("extractKeywords: Invalid arrangement item.", item);
      }
    });
  } else {
    console.warn("extractKeywords: arrangement is not an array.", arrangement);
  }

  return keywords;
}

export function createNewIteration(keywords, brief) {
  if (!Array.isArray(keywords)) {
    console.warn("createNewIteration: 'keywords' should be an array.", keywords);
    keywords = [];
  }
  return {
    prompt: [],
    generatedImages: [],
    keywords,
    brief,
    createdAt: new Date()
  };
}

export function createImgGenProgressCounter(io, roomId, boardId) {
  let count = 0;
  io.to(roomId).emit("addImgGenProgress", { boardId });

  return {
    add: (step = 1) => {
      count += step;
      io.to(roomId).emit("updateImgGenProgress", {
        boardId,
        progress: count,
      });
    }
  };
}

  // Helpers
  const buildDescMap = objects =>
    Array.isArray(objects)
      ? Object.fromEntries(
          objects.map(obj => [Object.keys(obj)[0], Object.values(obj)[0]])
        )
      : {};


  const prepareResult = (captionEntry, boxEntries = []) => {
    const prompt = captionEntry.Caption ?? "";
    const descMap = buildDescMap(captionEntry.Objects);
    const boxes = [];
    const phrases = [];
    for (const [label, box] of boxEntries) {
      boxes.push(box);
      if (descMap[label]) {
        phrases.push(descMap[label]);
      } else {
        console.warn(`generateImageInput: No description for box label '${label}' in caption '${prompt}'`);
        phrases.push("");
      }
    }

    return { prompt, negative_prompt: "", boxes, phrases };
  };

export async function generateImageInput(textDescriptions, arrangement) {
  if (!Array.isArray(textDescriptions)) {
    console.warn("generateImageInput: textDescriptions is not an array.", textDescriptions);
    return [];
  }

  // If no arrangement, generate layout
  if (!arrangement?.length) {
    if (typeof generateLayout !== 'function') {
      console.error("generateImageInput: generateLayout function is not defined.");
      return textDescriptions.map(captionEntry => prepareResult(captionEntry));
    }

    const genLayoutInput = textDescriptions.map(entry => ({
      Caption: entry.Caption,
      objects: Array.isArray(entry.Objects)
        ? entry.Objects.flatMap(obj => Object.keys(obj))
        : [],
    }));

    let layoutResults;
    try {
      layoutResults = await Promise.allSettled(
        genLayoutInput.map(item =>
          generateLayout(JSON.stringify(item, null, 2))
        )
      );
    } catch (err) {
      console.error("generateImageInput: Error generating layout:", err);
      // Fallback to empty box results
      return textDescriptions.map(captionEntry => prepareResult(captionEntry));
    }

    return textDescriptions.map((captionEntry, index) =>
      prepareResult(
        captionEntry,
        safeGetOutput(layoutResults[index] ?? {}, index)
      )
    );
  }

  // arrangement path -- assumes getTopFusedBoxes & matchLayout exist
  if (
    typeof getTopFusedBoxes !== "function" ||
    typeof matchLayout !== "function"
  ) {
    console.error(
      "generateImageInput: getTopFusedBoxes or matchLayout are not functions."
    );
    return textDescriptions.map(captionEntry => prepareResult(captionEntry));
  }

  const matchLayoutInput = textDescriptions.map(item => {
    const objectNames = Array.isArray(item.Objects)
      ? item.Objects.map(obj => Object.keys(obj)[0])
      : [];
    return {
      Caption: item.Caption,
      Objects: objectNames,
      Boxes: getTopFusedBoxes(arrangement, objectNames.length)
    };
  });

  let layoutResults;
  try {
    layoutResults = await Promise.allSettled(
      matchLayoutInput.map(item =>
        matchLayout(JSON.stringify(item, null, 2))
      )
    );
  } catch (err) {
    console.error("generateImageInput: Error matching layout:", err);
    return textDescriptions.map(captionEntry => prepareResult(captionEntry));
  }

  return textDescriptions.map((captionEntry, index) =>
    prepareResult(
      captionEntry,
      safeGetOutput(layoutResults[index] ?? {}, index)
    )
  );
}

export async function generateAndStoreImage({
  input,
  index,
  boardId,
  iterationId,
  roomId,
  progressCounter,
  io
}) {
  try {
    if (!input) throw new Error("Input missing in generateAndStoreImage.");

    if (typeof generateImage !== "function") {
      throw new Error("generateImage function not defined.");
    }

    const uploadResult = await generateImage(input);
    if (!uploadResult?.url) {
      throw new Error("Image generation returned no URL.");
    }

    await withRetry(() => updateNewImageAndPromptToIteration(
      boardId,
      iterationId,
      uploadResult.url,
      input
    ), 3, "updateToDB");

    io.to(roomId).emit("iterationImageUpdate", {
        boardId,
        iterationId,
        imageUrl: uploadResult.url,
        prompt: input?.prompt || ""
    });
  } catch (err) {
    console.error(
      `generateAndStoreImage: Failed to generate/upload image ${index}:`,
      err?.stack || err?.message || err
    );
  } finally {
    try {
      progressCounter?.add?.(25);
    } catch (e) {
      console.warn("generateAndStoreImage: Failed to update progress counter.", e);
    }
  }
}

function safeGetOutput(result, index) {
  if (result?.status === "fulfilled" && result.value?.output) {
    return result.value.output;
  }
  console.warn(`safeGetOutput: Layout generation failed at index ${index}.`, result?.reason || result);
  return [];
}
