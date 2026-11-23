const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const path = require("path");
const socketIo = require("socket.io");
const cors = require("cors");
const config = require("./config");
const hostname = process.env.HOST || "localhost";
const port = Number(process.env.PORT) || 3000;
let router = require("./router");
var app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.includes("*") ? "*" : allowedOrigins,
  credentials: true,
}));

mongoose
  .connect(config.db)
  .then(() => console.log("Conection successful!"))
  .catch((err) => console.error(err));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins.includes("*") ? "*" : allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Socket, new connection", socket.id);

  socket.on("disconnect", () => {
    console.log("👤: A user disconnected");
    socket.disconnect();
  });
});

const apiRouter = router.init(io);
app.use("/api", apiRouter);
app.use(apiRouter);
app.use("/images", express.static(path.join(__dirname, "images")));

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}`);
});