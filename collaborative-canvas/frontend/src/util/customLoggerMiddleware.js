// Shared helper functions
const getActionMeta = (meta) => (meta?.id ? ` by ${meta.name} (${meta.id})` : "");

const areArraysDifferent = (arr1, arr2) =>
  !Array.isArray(arr1) || !Array.isArray(arr2) ? arr1 !== arr2 :
  arr1.length !== arr2.length || arr1.some((val, i) => val !== arr2[i]);

const logAction = (type, actionMeta, action, details) => {
  console.group(`Action: ${type}${actionMeta}`);
  console.info("Dispatching", action);
  if (details) console.log(details.label, details.data);
  console.groupEnd();
};

// Logger Middleware Generator
const createLoggerMiddleware = (entity, trackedFields = []) => (store) => (next) => (action) => {
  const { type, payload, meta } = action;
  const actionMeta = getActionMeta(meta);

  if (type.startsWith(`${entity}/`)) {
    if ([`addKeyword`,`removeKeyword`, 
      `addThread`,`removeThread`, 
      `addImage`,`removeImage`, 
      `addBoard`,`removeBoard`, 
      "clearAllVotes", "updateBoardIterations"].some(suffix => type.endsWith(suffix))) {
      logAction(type, actionMeta, action, 
        [`addKeyword`, `addThread`,`addImage`, `addBoard`].some(suffix => type.endsWith(suffix)) ? { label: `New ${entity}:`, data: payload } : type.endsWith("updateBoardIterations") ? { label: `New Iteration:`, data: payload } : null);
    } else if (["updateKeyword", "updateThread", "updateBoard"].some(suffix => type.endsWith(suffix))) {
      const { id, changes } = payload;
      const prevState = store.getState()[entity]?.entities?.[id];

      if (prevState) {
        const stateChanges = Object.entries(changes)
          .filter(([key, value]) =>
            trackedFields.includes(key) &&
            areArraysDifferent(prevState[key], value) &&
            !(
              (key === "offsetX" || key === "offsetY") &&
              (value === undefined)
            )
          )
          .reduce((acc, [key, value]) => ({
            ...acc,
            [key]: { before: prevState[key], after: value },
          }), {});

        if (Object.keys(stateChanges).length) {
          logAction(`${type} [${Object.keys(stateChanges).join(", ")}]`, actionMeta, action, { label: "State Changes:", data: stateChanges });
        }
      }
    }
  }
  return next(action);
};

export const keywordLoggerMiddleware = createLoggerMiddleware("keywords", ["votes", "downvotes", "isSelected", "offsetX", "offsetY"]);
export const imageLoggerMiddleware = createLoggerMiddleware("images");
export const threadLoggerMiddleware = createLoggerMiddleware("threads", ["isResolved", "value"]);
export const boardLoggerMiddleware = createLoggerMiddleware("boards", ["name", "isStarred", "isVoting"]);

// Room Logger Middleware (custom handling due to different state structure)
export const roomLoggerMiddleware = (store) => (next) => (action) => {
  const { type, meta } = action;
  const actionMeta = getActionMeta(meta);

  if (!["socket/updateDesignDetailsFull", "socket/setRoomName"].includes(type)) return next(action);

  const prevState = store.getState().room;
  const result = next(action);
  const nextState = store.getState().room;

  if (!prevState || !nextState) return result;

  const trackedFields = ["designDetailsFull", "roomName"];
  const changes = trackedFields.reduce((acc, key) => (
    prevState[key] !== nextState[key] ? { ...acc, [key]: { before: prevState[key], after: nextState[key] } } : acc
  ), {});

  if (Object.keys(changes).length) logAction(type, actionMeta, action, { label: "State Changes:", data: changes });
  return result;
};