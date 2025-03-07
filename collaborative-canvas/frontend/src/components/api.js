const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

// Helper function to simplify fetch calls and error handling
const apiFetch = async (endpoint, options = {}) => {
  const response = await fetch(`${baseURL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

/* -----------------------------
   BOARD FUNCTIONS
------------------------------ */

export const createBoard = async (name) => {
  return apiFetch('/boards', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
};

export const getBoard = async (id) => {
  return apiFetch(`/boards/${id}`, {
    method: 'GET',
  });
};

export const updateBoardName = async (id, newName) => {
  return apiFetch(`/boards/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name: newName }),
  });
};

export const deleteBoard = async (id) => {
  return apiFetch(`/boards/${id}`, {
    method: 'DELETE',
  });
};

export const getAllBoardInfo = async (id) => {
  return apiFetch(`/boards/${id}/all`, {
    method: 'GET',
  });
};

/* -----------------------------
   IMAGE FUNCTIONS
------------------------------ */

export const createImage = async (boardId, url, x, y) => {
  return apiFetch('/images', {
    method: 'POST',
    body: JSON.stringify({ boardId, url, x, y }),
  });
};

export const updateImageCoordinates = async (id, x, y) => {
  return apiFetch(`/images/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ x, y }),
  });
};

export const deleteImage = async (id) => {
  return apiFetch(`/images/${id}`, {
    method: 'DELETE',
  });
};

/* -----------------------------
   KEYWORD FUNCTIONS
------------------------------ */

export const createKeywordManual = async (boardId, imageId, x, y, isSelected, type, keyword) => {
  return apiFetch('/keywords', {
    method: 'POST',
    body: JSON.stringify({ boardId, imageId, x, y, isSelected, type, keyword }),
  });
};

export const toggleKeywordSelection = async (id) => {
  return apiFetch(`/keywords/${id}/toggle`, {
    method: 'PATCH',
  });
};

export const deleteKeyword = async (id) => {
  return apiFetch(`/keywords/${id}`, {
    method: 'DELETE',
  });
};

/* -----------------------------
   ROOM FUNCTIONS
------------------------------ */

/**
 * Create a new room.
 * @param {string} name - The name of the room.
 * @returns {Promise<Object>}
 */
export const createRoom = async (name) => {
  return apiFetch('/rooms/create', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
};

/**
 * Update room name.
 * @param {string} roomId - The room ID.
 * @param {string} newName - The new room name.
 * @returns {Promise<Object>}
 */
export const updateRoomName = async (roomId, newName) => {
  return apiFetch(`/rooms/${roomId}`, {
    method: 'PUT',
    body: JSON.stringify({ newName }),
  });
};

/**
 * Delete a room.
 * @param {string} roomId - The room ID.
 * @returns {Promise<Object>}
 */
export const deleteRoom = async (roomId) => {
  return apiFetch(`/rooms/${roomId}`, {
    method: 'DELETE',
  });
};

/**
 * Join a room by join code.
 * @param {string} joinCode - The join code for the room.
 * @returns {Promise<Object>}
 */
export const joinRoom = async (joinCode) => {
  return apiFetch(`/rooms/join/${joinCode}`, {
    method: 'GET',
  });
};
