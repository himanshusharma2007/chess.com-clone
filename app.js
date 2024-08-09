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
let currentplayer = "W";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index");
});

io.on("connection", (uniqueSoket) => {
  console.log("connection");
  uniqueSoket.on("xyz", () => {
    console.log("xyz is recivied");
    io.emit("somthing");
  });

  uniqueSoket.on("disconnect", () => {
    console.log("disconnected");
  });
  if (!players.white) {
    players.white = uniqueSoket.id;
    socket.emit("playerRole", "w");
  } else if (!players.black) {
    players.black = uniqueSoket.id;
    socket.emit("playerRole", "b");
  } else {
    socket.emit("spectatorRole");
  }

  uniqueSoket.on("disconnect", () => {
    if (players.white === uniqueSoket.id) {
      delete players.white;
    }
    if (players.black === uniqueSoket.id) {
      delete players.black;
    }
  });

  uniqueSoket.on("move", (move) => {
    try {
      if (chess.move() === "w" && uniqueSoket.id !== players.white) return;
      if (chess.move() === "b" && uniqueSoket.id !== players.black) return;

      let result = chess.move(move);
      if (result) {
        currentplayer = chess.turn();
        io.emit("movem", move);
        io.emit("boardState", chess.fen());
      } else {
        console.log("Invalid move :>> ", move);
        uniqueSoket.emit("InvalidMove :>> ", move);
      }
    } catch (error) {
      console.log("error :>> ", error);
      console.log("Invalid move :>> ", move);
      uniqueSoket.emit("InvalidMove :>> ", move);
    }
  });
});

server.listen(3000, () => {
  console.log("server is running at port 3000");
});
