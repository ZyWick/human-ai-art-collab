import { renderHook } from "@testing-library/react"; // Use this instead of react-hooks

import useBoardSocket from "../hook/useBoardSocket";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";

jest.mock("../context/SocketContext", () => ({
  useSocket: jest.fn(),
}));

jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

describe("useBoardSocket - Keyword Events", () => {
    let mockDispatch, mockSocket, mockUser;
  
    beforeEach(() => {
      mockDispatch = jest.fn();
      mockSocket = {
        emit: jest.fn(),
        on: jest.fn(),
        removeAllListeners: jest.fn(),
      };
  
      mockUser = { id: "user123", username: "testUser" };
  
      useDispatch.mockReturnValue(mockDispatch);
      useSocket.mockReturnValue(mockSocket);
      useAuth.mockReturnValue({ user: mockUser });
  
      useSelector.mockImplementation((selector) =>
        selector({
          room: { roomId: "room123", currentBoardId: "board123" },
          boards: { ids: [], entities: {} },
          keywords: {
            ids: ["kw1", "kw2"],
            entities: {
              kw1: { _id: "kw1", name: "Keyword 1" },
              kw2: { _id: "kw2", name: "Keyword 2" },
            },
          },
          images: { ids: [], entities: {} },
          threads: { ids: [], entities: {} },
        })
      );
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it("should handle 'newKeyword' event correctly", () => {
      renderHook(() => useBoardSocket());
  
      const callback = mockSocket.on.mock.calls.find(([event]) => event === "newKeyword")[1];
      callback({
        keyword: { _id: "kw1", name: "Keyword1", boardId: "board123", imageId: "img1" },
        user: mockUser,
      });
  
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "keywords/addKeyword",
          payload: { _id: "kw1", name: "Keyword1", boardId: "board123", imageId: "img1" },
        })
      );
  
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "images/addKeywordToImage",
          payload: { keywordId: "kw1", imageId: "img1" },
        })
      );
    });
  
    it("should handle 'deleteKeyword' event correctly", () => {
      renderHook(() => useBoardSocket());
  
      const callback = mockSocket.on.mock.calls.find(([event]) => event === "deleteKeyword")[1];
      callback({
        keywordId: "kw1",
        imageId: "img1",
        user: mockUser,
      });
  
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "images/removeKeywordFromImage",
          payload: { keywordId: "kw1", imageId: "img1" },
        })
      );
  
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "keywords/removeKeyword",
          payload: "kw1",
        })
      );
  
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "selection/removeSelectedKeyword",
          payload: "kw1",
        })
      );
    });
  
    it("should handle 'updateKeyword' event correctly", () => {
      renderHook(() => useBoardSocket());
  
      const callback = mockSocket.on.mock.calls.find(([event]) => event === "updateKeyword")[1];
      callback({
        update: { id: "kw1", changes: { name: "UpdatedKeyword" } },
        user: mockUser,
      });
  
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "keywords/updateKeyword",
          payload: { id: "kw1", changes: { name: "UpdatedKeyword" } },
        })
      );
    });
  
    it("should handle 'clearKeywordVotes' event correctly if boardId matches", () => {
      renderHook(() => useBoardSocket());
  
      const callback = mockSocket.on.mock.calls.find(([event]) => event === "clearKeywordVotes")[1];
      callback({ boardId: "board123", user: mockUser });
  
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "keywords/clearAllVotes",
          payload: {},
        })
      );
    });
  
    it("should NOT dispatch 'clearAllVotes' if boardId does not match", () => {
      renderHook(() => useBoardSocket());
  
      const callback = mockSocket.on.mock.calls.find(([event]) => event === "clearKeywordVotes")[1];
      callback({ boardId: "anotherBoard", user: mockUser });
  
      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: "keywords/clearAllVotes" })
      );
    });
  
    it("should handle 'removeKeywordOffset' event correctly", () => {
      renderHook(() => useBoardSocket());
  
      const callback = mockSocket.on.mock.calls.find(([event]) => event === "removeKeywordOffset")[1];
      callback({ _id: "kw123", user: mockUser });
  
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "keywords/updateKeyword",
          payload: { id: "kw123", changes: { offsetX: undefined, offsetY: undefined, isSelected: false} },
        })
      );
  
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "selection/removeSelectedKeyword",
          payload: "kw123",
        })
      );
    });
  
    it("should handle 'updateKeywordSelected' event correctly and add to selected keywords", () => {
      renderHook(() => useBoardSocket());
  
      const callback = mockSocket.on.mock.calls.find(([event]) => event === "updateKeywordSelected")[1];
      callback({ update: { id: "k1", changes: { isSelected: true } }, user: mockUser });
  
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "keywords/updateKeyword",
          payload: { id: "k1", changes: { isSelected: true } },
        })
      );
  
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "selection/addSelectedKeyword",
          payload: "k1",
        })
      );
    });
  
    it("should handle 'updateKeywordSelected' event correctly and remove from selected keywords", () => {
      renderHook(() => useBoardSocket());
  
      const callback = mockSocket.on.mock.calls.find(([event]) => event === "updateKeywordSelected")[1];
      callback({ update: { id: "k1", changes: { isSelected: false } }, user: mockUser });
  
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "keywords/updateKeyword",
          payload: { id: "k1", changes: { isSelected: false } },
        })
      );
  
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "selection/removeSelectedKeyword",
          payload: "k1",
        })
      );
    });
  });
  

describe("useBoardSocket - Thread Events", () => {
    let mockDispatch, mockSocket, mockUser;
  
    beforeEach(() => {
      mockDispatch = jest.fn();
      mockSocket = {
        emit: jest.fn(),
        on: jest.fn(),
        removeAllListeners: jest.fn(),
      };
  
      mockUser = { id: "user123", username: "testUser" };
  
      useDispatch.mockReturnValue(mockDispatch);
      useSocket.mockReturnValue(mockSocket);
      useAuth.mockReturnValue({ user: mockUser });
  
      useSelector.mockImplementation((selector) =>
          selector({
            room: { roomId: "room123", currentBoardId: "board123" },
            boards: {
              ids: [],
              entities: {},
            },
            keywords: {
              ids: ['kw1', 'kw2'],
              entities: {
                kw1: { _id: 'kw1', name: 'Keyword 1' },
                kw2: { _id: 'kw2', name: 'Keyword 2' },
              }
            },
            images: {
              ids: [],
              entities: {},
            },
            threads: {
              ids: [],
              entities: {},
            }
          })
        );
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
   
    it("should handle 'addThread' event correctly", () => {
      renderHook(() => useBoardSocket());
  
      const callback = mockSocket.on.mock.calls.find(([event]) => event === "addThread")[1];
      callback({
        newThread: { _id: "thread1", text: "New thread", boardId: "board123" },
        user: mockUser,
      });
  
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "threads/addThread" }));
    });
  
    it("should handle 'updateThread' event correctly", () => {
      renderHook(() => useBoardSocket());
  
      const callback = mockSocket.on.mock.calls.find(([event]) => event === "updateThread")[1];
      callback({
        update: { id: "thread1", changes: { text: "Updated thread" } },
        user: mockUser,
      });
  
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "threads/updateThread" }));
    });
  
    
  });
  

describe("useBoardSocket - Image Events", () => {
    let mockDispatch, mockSocket, mockUser;
  
    beforeEach(() => {
      mockDispatch = jest.fn();
      mockSocket = {
        emit: jest.fn(),
        on: jest.fn(),
        removeAllListeners: jest.fn(),
      };
  
      mockUser = { id: "user123", username: "testUser" };
  
      useDispatch.mockReturnValue(mockDispatch);
      useSocket.mockReturnValue(mockSocket);
      useAuth.mockReturnValue({ user: mockUser });
  
      useSelector.mockImplementation((selector) =>
          selector({
            room: { roomId: "room123", currentBoardId: "board123" },
            boards: {
              ids: [],
              entities: {},
            },
            keywords: {
              ids: ['kw1', 'kw2'],
              entities: {
                kw1: { _id: 'kw1', name: 'Keyword 1' },
                kw2: { _id: 'kw2', name: 'Keyword 2' },
              }
            },
            images: {
              ids: [],
              entities: {},
            },
            threads: {
              ids: [],
              entities: {},
            }
          })
        );
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it("should handle 'newImage' event correctly", () => {
      renderHook(() => useBoardSocket());
  
      const callback = mockSocket.on.mock.calls.find(([event]) => event === "newImage")[1];
      callback({
        image: {
            _id: "i5",
            boardId: "board123",
            url: "https://example.com/pikachu.webp",
            x: -80.77,
            y: -785.6,
            width: 258,
            height: 173,
            keywords: [{_id: "k7"}, {_id: "k8"}],
          },
        user: mockUser,
      });
  
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "images/addImage" }));
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "keywords/addKeywords" }));
    });

    it("should NOT dispatch 'addImage and addKeywords' if boardId does not match", () => {
        renderHook(() => useBoardSocket());
    
        const callback = mockSocket.on.mock.calls.find(([event]) => event === "newImage")[1];
        callback({
          image: {
              _id: "i5",
              boardId: "b3",
              url: "https://example.com/pikachu.webp",
              x: -80.77,
              y: -785.6,
              width: 258,
              height: 173,
              keywords: [{_id: "k7"}, {_id: "k8"}],
            },
          user: mockUser,
        });
    
        expect(mockDispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: "images/addImage" }));
        expect(mockDispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: "keywords/addKeywords" }));
      });
  
    it("should handle 'deleteImage' event correctly", () => {
      renderHook(() => useBoardSocket());
  
      const callback = mockSocket.on.mock.calls.find(([event]) => event === "deleteImage")[1];
      callback({
        _id: "i2", keywords: ["k1", "k4"],
        user: mockUser,
      });
  
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "images/removeImage" }));
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "keywords/removeKeywords" }));
    //   expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "selection/removeSelectedKeyword" }));
    });
  
    it("should handle 'updateImage' event correctly", () => {
      renderHook(() => useBoardSocket());
  
      const callback = mockSocket.on.mock.calls.find(([event]) => event === "updateImage")[1];
      callback({
        update: { id: "i1", changes: { x: 52, y: 52 } },
        user: mockUser,
      });
  
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "images/updateImage"}));
    });    
  });
  
  describe("useBoardSocket - board Events", () => {
    let mockDispatch, mockSocket, mockUser, mockBoards;
  
    beforeEach(() => {
      mockDispatch = jest.fn();
      mockSocket = {
        emit: jest.fn(),
        on: jest.fn(),
        removeAllListeners: jest.fn(),
      };
      mockUser = { id: "user123", username: "testUser" };
  
      useDispatch.mockReturnValue(mockDispatch);
      useSocket.mockReturnValue(mockSocket);
      useAuth.mockReturnValue({ user: mockUser });
  
      mockBoards = {
        ids: ["b1", "b2", "b3"],
        entities: {
          b1: { _id: "b1", name: "Board 1", updatedAt: 1000 },
          b2: { _id: "b2", name: "Board 2", updatedAt: 2000 },
          b3: { _id: "b3", name: "Board 3", updatedAt: 1500 },
        },
      };
  
      useSelector.mockImplementation((selector) =>
        selector({
          room: { currentBoardId: "b1" },
          boards: mockBoards,
        })
      );
  
      renderHook(() => useBoardSocket());
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  

    it("should handle 'newBoard' event correctly", () => {
      const callback = mockSocket.on.mock.calls.find(([event]) => event === "newBoard")[1];
      callback({
        newBoardId: "b2",
        user: mockUser,
      });
  
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "boards/addBoard" }));
    });
    
    it("should handle 'updateBoard' event correctly", () => {
        const callback = mockSocket.on.mock.calls.find(([event]) => event === "updateBoard")[1];
        callback({
          update: { id: "b1", changes: {name: "updateName"}},
          user: mockUser,
        });
    
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "boards/updateBoard"}));
      });  

    it("should handle 'updateBoardIterations' event correctly", () => {  
      const callback = mockSocket.on.mock.calls.find(([event]) => event === "updateBoardIterations")[1];
      callback({
        id: "b1", iteration: {
            generatedImages: [
              "https://example.com/image3.jpg",
              "https://example.com/image4.png",
            ],
            keywords: [
              { keyword: "holding an apple", type: "Action & pose", _id: "k1" },
            ],
          },
        user: mockUser,
      });
  
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "boards/updateBoardIterations" }));
   });
   const getSocketCallback = (eventName) =>
    mockSocket.on.mock.calls.find(([event]) => event === eventName)?.[1];

  it("should dispatch removeBoard when a board is deleted", () => {
    const callback = getSocketCallback("deleteBoard");
    callback({ boardId: "b1", user: mockUser });

    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: "boards/removeBoard",
      payload: "b1",
    }));
  });

  it("should update currentBoardId to the latest updated board if the deleted board was the current board", () => {
    const callback = getSocketCallback("deleteBoard");
    callback({ boardId: "b1", user: mockUser });

    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "boards/removeBoard", payload: "b1" }));
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "socket/setCurrentBoardId", payload: "b2" }));
  });

  it("should not update currentBoardId if the deleted board was not the current board", () => {
    const callback = getSocketCallback("deleteBoard");
    callback({ boardId: "b3", user: mockUser });

    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "boards/removeBoard", payload: "b3" }));
    expect(mockDispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: "socket/setCurrentBoardId" }));
  });
   
});
    

  describe("useBoardSocket - room Events", () => {
    let mockDispatch, mockSocket, mockUser;
  
    beforeEach(() => {
      mockDispatch = jest.fn();
      mockSocket = {
        emit: jest.fn(),
        on: jest.fn(),
        removeAllListeners: jest.fn(),
      };
  
      mockUser = { id: "user123", username: "testUser" };
  
      useDispatch.mockReturnValue(mockDispatch);
      useSocket.mockReturnValue(mockSocket);
      useAuth.mockReturnValue({ user: mockUser });
  
      useSelector.mockImplementation((selector) =>
          selector({
            room: { roomId: "room123", currentBoardId: "board123" },
            boards: {
              ids: [],
              entities: {},
            },
            keywords: {
              ids: ['kw1', 'kw2'],
              entities: {
                kw1: { _id: 'kw1', name: 'Keyword 1' },
                kw2: { _id: 'kw2', name: 'Keyword 2' },
              }
            },
            images: {
              ids: [],
              entities: {},
            },
            threads: {
              ids: [],
              entities: {},
            }
          })
        );
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it("should handle 'updateRoomUsers' event correctly", () => {
      renderHook(() => useBoardSocket());
  
      const callback = mockSocket.on.mock.calls.find(([event]) => event === "updateRoomUsers")[1];
      callback(["u1", "u2"]);
  
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "socket/setUsers" }));
    });
    
    it("should handle 'updateRoomName' event correctly", () => {
        renderHook(() => useBoardSocket());
    
        const callback = mockSocket.on.mock.calls.find(([event]) => event === "updateRoomName")[1];
        callback({
        newRoomName: "updateName",
          user: mockUser,
        });
    
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "socket/setRoomName"}));
      });  

    it("should handle 'updateDesignDetails' event correctly", () => {
      renderHook(() => useBoardSocket());
  
      const callback = mockSocket.on.mock.calls.find(([event]) => event === "updateDesignDetails")[1];
      callback({
        designDetails: {objective: "to test"},
        user: mockUser,
      });
  
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "socket/updateDesignDetails" }));
   });
    
  });