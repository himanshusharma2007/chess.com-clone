const socket = io();
const chess = new Chess();
const chessBoard = document.querySelector(".chessboard");
let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
  const board = chess.board();
  chessBoard.innerHTML = ""; // Clear previous board state

  board.forEach((row, rowIndex) => {
    row.forEach((square, squareIndex) => {
      const squareElement = document.createElement("div");
      squareElement.classList.add(
        "square",
        (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark"
      );
      squareElement.dataset.row = rowIndex;
      squareElement.dataset.col = squareIndex;

      if (square) {
        // If there is a piece on this square
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );
        pieceElement.innerText = getUniCode(square);
        pieceElement.draggable = true; // Always make pieces draggable
        pieceElement.addEventListener("dragstart", (e) => {
          if (playerRole === chess.turn() && playerRole === square.color) {
            draggedPiece = pieceElement;
            sourceSquare = { row: rowIndex, col: squareIndex };
            e.dataTransfer.setData("text/plain", "");
          } else {
            e.preventDefault(); // Prevent dragging if it's not the player's turn or piece
          }
        });

        pieceElement.addEventListener("dragend", () => {
          draggedPiece = null;
          sourceSquare = null;
        });
        squareElement.appendChild(pieceElement);
      }

      squareElement.addEventListener("dragover", (e) => {
        e.preventDefault(); // Allow drop
      });

      squareElement.addEventListener("drop", () => {
        if (draggedPiece) {
          const targetSquare = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.col),
          };
          handleMove(sourceSquare, targetSquare);
        }
      });

      chessBoard.appendChild(squareElement); // Append square to the board
    });
  });
};

const handleMove = (sourceSquare, targetSquare) => {
  console.log("Attempting move");
  console.log("Player role:", playerRole);
  console.log("Current turn:", chess.turn());

  console.log("Move from:", sourceSquare, "to", targetSquare);
  const move = {
    from: `${String.fromCharCode(97 + sourceSquare.col)}${
      8 - sourceSquare.row
    }`,
    to: `${String.fromCharCode(97 + targetSquare.col)}${8 - targetSquare.row}`,
    promotion: "q", // Always promote to queen for now
  };

  const validMove = chess.move(move); // Make the move on the local board first
  if (validMove) {
    socket.emit("move", move); // Emit the move if it's valid
  } else {
    console.log("Invalid move:", move);
  }
};
const updateTurnIndicator = () => {
  const turnIndicator = document.getElementById("turn-indicator");
  if (turnIndicator) {
    turnIndicator.textContent = `Current turn: ${
      chess.turn() === "w" ? "White" : "Black"
    }`;
    turnIndicator.style.color = chess.turn() === "w" ? "white" : "black";
  }
};
const updatePlayerRoleIndicator = () => {
  const roleIndicator = document.getElementById("player-role");
  if (roleIndicator) {
    roleIndicator.textContent = `Your role: ${
      playerRole === "w" ? "White" : playerRole === "b" ? "Black" : "Spectator"
    } (${playerRole === chess.turn() ? "Your turn" : "Opponent's turn"})`;
  }
};
const updateDraggableState = () => {
  console.log("Updating draggable state");
  console.log("Player role:", playerRole);
  console.log("Current turn:", chess.turn());

  const pieces = document.querySelectorAll(".piece");
  const currentTurn = chess.turn();
  pieces.forEach((piece) => {
    const square = piece.parentElement;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    const pieceOnSquare = chess.get(String.fromCharCode(97 + col) + (8 - row));
    if (pieceOnSquare) {
      piece.draggable =
        playerRole === pieceOnSquare.color && playerRole === currentTurn;
      console.log(
        "Piece color:",
        pieceOnSquare.color,
        "Draggable:",
        piece.draggable
      );
    }
  });
};
const getUniCode = (piece) => {
  const chessPieceUnicode = {
    p: "♙", // Black Pawn
    r: "\u265C", // Black Rook
    n: "\u265E", // Black Knight
    b: "\u265D", // Black Bishop
    q: "\u265B", // Black Queen
    k: "\u265A", // Black King
    P: "♙", // White Pawn
    R: "\u2656", // White Rook
    N: "\u2658", // White Knight
    B: "\u2657", // White Bishop
    Q: "\u2655", // White Queen
    K: "\u2654", // White King
  };
  return chessPieceUnicode[piece.type] || "";
};

socket.on("playerRole", (role) => {
  console.log("Received player role:", role);
  playerRole = role;
  renderBoard();
  updateTurnIndicator();
  updateDraggableState();
});
socket.on("spectatorRole", (role) => {
  playerRole = "";
  renderBoard();
});

socket.on("boardState", (fen) => {
  chess.load(fen);
  renderBoard();
});

socket.on("move", (move) => {
  chess.move(move);
  renderBoard();
  updateTurnIndicator();

  // Update playerRole to match the current turn
  if (playerRole !== "") {
    // Only update if the player is not a spectator
    playerRole = chess.turn();
  }

  updateDraggableState();
});

renderBoard();
