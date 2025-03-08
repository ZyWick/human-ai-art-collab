const baseURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

/**
 * Helper function to make API calls using fetch.
 * It handles JSON requests by stringifying data and setting headers,
 * and automatically skips these for FormData instances.
 *
 * @param {string} endpoint - The API endpoint.
 * @param {object} options - Options including method, data, and headers.
 * @returns {Promise<any>} - Parsed JSON response.
 */
const apiFetch = async (
  endpoint,
  { method = "GET", data = null, headers = {} } = {}
) => {
  const url = `${baseURL}${endpoint}`;
  const fetchOptions = { method, headers: { ...headers } };

  if (data) {
    if (data instanceof FormData) {
      // For FormData, do not set Content-Type so that the browser can add the correct boundary
      fetchOptions.body = data;
    } else {
      fetchOptions.body = JSON.stringify(data);
      // Set default Content-Type for JSON requests if not already provided
      if (!fetchOptions.headers["Content-Type"]) {
        fetchOptions.headers["Content-Type"] = "application/json";
      }
    }
  }

  try {
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `API error on ${method.toUpperCase()} ${endpoint}:`,
        errorText
      );
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(
      `API error on ${method.toUpperCase()} ${endpoint}:`,
      error.message
    );
    throw error;
  }
};

/* -----------------------------
   UPLOAD IMAGE
------------------------------ */

/**
 * Uploads an image using a FormData object.
 * Note: For file uploads, FormData is used so the Content-Type header is set automatically.
 *
 * @param {FormData} formData - The form data containing the file.
 * @param {string} socketId - The socket identifier.
 * @param {string} boardId - The board identifier.
 * @returns {Promise<any>} - The API response.
 */
export const uploadImageApi = async (formData, socketId, boardId) => {
  try {
    const url = `${baseURL}/upload`;
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        "socket-id": socketId,
        "board-id": boardId,
        // Do not set Content-Type; let the browser handle it for FormData
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error uploading image:", errorText);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error uploading image:", error.message);
    throw error;
  }
};

/* -----------------------------
   BOARD FUNCTIONS
------------------------------ */
export const createBoard = async (name) =>
  apiFetch("/boards", { method: "POST", data: { name } });

export const getBoard = async (id) =>
  apiFetch(`/boards/${id}`, { method: "GET" });

export const updateBoardName = async (id, newName) =>
  apiFetch(`/boards/${id}`, { method: "PUT", data: { name: newName } });

export const deleteBoard = async (id) =>
  apiFetch(`/boards/${id}`, { method: "DELETE" });

export const getAllBoardInfo = async (id) =>
  apiFetch(`/boards/${id}/all`, { method: "GET" });

/* -----------------------------
   IMAGE FUNCTIONS
------------------------------ */
export const createImage = async (boardId, url, x, y) =>
  apiFetch("/images", { method: "POST", data: { boardId, url, x, y } });

export const updateImageCoordinates = async (id, x, y) =>
  apiFetch(`/images/${id}`, { method: "PUT", data: { x, y } });

export const deleteImage = async (id) =>
  apiFetch(`/images/${id}`, { method: "DELETE" });

/* -----------------------------
   KEYWORD FUNCTIONS
------------------------------ */
export const createKeywordManual = async (
  boardId,
  imageId,
  type,
  keyword
) => {
  return  apiFetch("/keywords", {
    method: "POST",
    data: { boardId, imageId, isSelected: false, 
      type, keyword },
  });}

export const toggleKeywordSelection = async (id) =>
  apiFetch(`/keywords/${id}/toggle`, { method: "PATCH" });

export const deleteKeyword = async (id) =>
  apiFetch(`/keywords/${id}`, { method: "DELETE" });

/* -----------------------------
   ROOM FUNCTIONS
------------------------------ */
export const createRoom = async (name) =>
  apiFetch("/rooms/create", { method: "POST", data: { name } });

export const updateRoomName = async (roomId, newName) =>
  apiFetch(`/rooms/${roomId}`, { method: "PUT", data: { newName } });

export const deleteRoom = async (roomId) =>
  apiFetch(`/rooms/${roomId}`, { method: "DELETE" });

export const joinRoom = async (joinCode) =>
  apiFetch(`/rooms/join/${joinCode}`, { method: "GET" });
