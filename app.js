const express = require("express");
const app = express();
const path = require("path");
const socket = require("socket.io");
const { Chess } = require("chess.js");
const http = require("http");
const server = http.createServer(app);
const io = socket(server);
const chess = new Chess();
const players = {};

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index");
});

io.on("connection", (uniqueSocket) => {
  console.log("connection");

  if (!players.white) {
    players.white = uniqueSocket.id;
    uniqueSocket.emit("playerRole", "w");
  } else if (!players.black) {
    players.black = uniqueSocket.id;
    uniqueSocket.emit("playerRole", "b");
  } else {
    uniqueSocket.emit("spectatorRole");
  }

  uniqueSocket.on("disconnect", () => {
    if (players.white === uniqueSocket.id) {
      delete players.white;
    }
    if (players.black === uniqueSocket.id) {
      delete players.black;
    }
  });

  uniqueSocket.on("move", (move) => {
    try {
      // Check if the player making the move has the correct turn
      const currentTurn = chess.turn();
      if (
        (currentTurn === "w" && uniqueSocket.id !== players.white) ||
        (currentTurn === "b" && uniqueSocket.id !== players.black)
      ) {
        uniqueSocket.emit("InvalidMove", "It's not your turn!");
        return;
      }

      let result = chess.move(move); // Make the move

      if (result) {
        io.emit("move", move); // Emit the move to all clients
        io.emit("boardState", chess.fen()); // Emit the updated board state
      } else {
        uniqueSocket.emit("InvalidMove", move);
      }
    } catch (error) {
      uniqueSocket.emit("InvalidMove", move);
    }
  });
});

server.listen(3000, () => {
  console.log("server is running at port 3000");
});
