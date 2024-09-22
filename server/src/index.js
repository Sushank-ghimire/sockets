import express, { json } from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";

const port = 3000;

const app = express();

app.use(json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello world");
});

const server = new createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("New user connected. : ", socket.id);

  socket.emit("greet", "welcome to the users connected.");

  socket.broadcast.emit("user", `${socket.id} : joined the server.`);

  socket.on("disconnect", () => {
    console.log("User disconnected having id : ", socket.id);
  });

  socket.on("message", (msg) => {
    // Emit the message to all clients, including the sender
    io.emit("messageReceiver", msg, socket.id); // Change socket.emit to io.emit
    console.log(msg, socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server listining at port : ${port}`);
});
