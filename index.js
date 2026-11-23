const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const path = require("path");
const socketIo = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const config = require("./config");
const hostname = process.env.HOST || "localhost";
const port = Number(process.env.PORT) || 3000;
let router = require("./router");
var app = express();

const configuredOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = process.env.NODE_ENV === "production"
  ? configuredOrigins
  : ["http://localhost:5173", "http://127.0.0.1:5173", ...configuredOrigins];

const corsOrigin = (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
    return;
  }
  callback(new Error("Origin not allowed by CORS"));
};

app.use(cookieParser());
app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));

mongoose
  .connect(config.db)
  .then(() => console.log("Conection successful!"))
  .catch((err) => console.error(err));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: corsOrigin,
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