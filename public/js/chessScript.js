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
        pieceElement.innerText = getUniCode(square); // Add piece type (P, R, N, etc.)
        pieceElement.draggable = playerRole === square.color;
        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            draggedPiece = pieceElement;
            sourceSquare = { row: rowIndex, col: squareIndex };
            e.dataTransfer.setData("text/plain", ""); // Required for drag-and-drop
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
  console.log("Move from:", sourceSquare, "to", targetSquare);
  constmove = {
    from: `${String.fromCharCode(97 + sourceSquare.col)} ${String.fromCharCode(
      8 - sourceSquare.col
    )}`,
    to: `${String.fromCharCode(97 + targetSquare.col)} ${String.fromCharCode(
      8 - targetSquare.col
    )}`,
    promotion: "q",
  };
  // Logic to handle move
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
renderBoard();
