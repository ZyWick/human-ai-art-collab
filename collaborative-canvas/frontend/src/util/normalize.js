export function normalizeRoom(data) {
    const normalized = {
      room: {
        id: data._id,
        name: data.name,
        joinCode: data.joinCode,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        boards: [] // will hold board IDs
      },
      boards: {},
      images: {},
      keywords: {}
    };
  
    // Process each board
    data.boards.forEach(board => {
      // Save board ID in the room record
      normalized.room.boards.push(board._id);
      // Add board info with a placeholder for images
      normalized.boards[board._id] = {
        id: board._id,
        name: board.name,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt,
        __v: board.__v,
        images: [] // will hold image IDs
      };
  
      // Process images on this board
      board.images.forEach(image => {
        // Link the image ID to its board
        normalized.boards[board._id].images.push(image._id);
        // Save image details along with its keywords
        normalized.images[image._id] = {
          id: image._id,
          boardId: image.boardId,
          url: image.url,
          x: image.x,
          y: image.y,
          width: image.width,
          height: image.height,
          createdAt: image.createdAt,
          updatedAt: image.updatedAt,
          __v: image.__v,
          keywords: [] // will hold keyword IDs
        };
  
        // Process keywords for this image
        image.keywords.forEach(keyword => {
          // Link the keyword ID to its image
          normalized.images[image._id].keywords.push(keyword._id);
          // Save keyword details
          normalized.keywords[keyword._id] = {
            id: keyword._id,
            boardId: keyword.boardId,
            imageId: keyword.imageId,
            offsetX: keyword.offsetX,
            offsetY: keyword.offsetY,
            isSelected: keyword.isSelected,
            type: keyword.type,
            keyword: keyword.keyword,
            createdAt: keyword.createdAt,
            updatedAt: keyword.updatedAt,
            __v: keyword.__v
          };
        });
      });
    });
  
    return normalized;
  }
  