const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const roomUsers = {};
const roomUserNames = {};
const privateRooms = {};

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("join_chat", (data) => {
    const {
      room,
      password,
      isPrivate,
    } = data;

    if (isPrivate) {
      if (!privateRooms[room]) {
        privateRooms[room] = password;
      } else {
        if (
          privateRooms[room] !== password
        ) {
          socket.emit(
            "wrong_password"
          );

          return;
        }
      }
    }

    socket.join(room);

    socket.userData = data;

    if (!roomUsers[room]) {
      roomUsers[room] = 0;
    }

    if (!roomUserNames[room]) {
      roomUserNames[room] = [];
    }

    roomUsers[room]++;

    roomUserNames[room].push(data.name);

    io.to(room).emit("update_users", {
      users: roomUserNames[room],
    });

    io.to(room).emit("user_joined", {
      message: `${data.name} joined ${room}`,
    });

    io.to(room).emit(
      "online_users",
      roomUsers[room]
    );
  });

  socket.on("send_message", (data) => {
    io.to(data.room).emit(
      "receive_message",
      data
    );
  });

  socket.on("typing", (data) => {
    socket.to(data.room).emit(
      "show_typing",
      data
    );
  });

  socket.on("switch_room", (data) => {
  const oldRoom = socket.userData.room;

  socket.leave(oldRoom);

  roomUsers[oldRoom]--;

  roomUserNames[oldRoom] =
    roomUserNames[oldRoom].filter(
      (user) =>
        user !== socket.userData.name
    );

  io.to(oldRoom).emit("update_users", {
    users: roomUserNames[oldRoom],
  });

  io.to(oldRoom).emit(
    "online_users",
    roomUsers[oldRoom]
  );

  socket.join(data.newRoom);

  socket.userData.room = data.newRoom;

  if (!roomUsers[data.newRoom]) {
    roomUsers[data.newRoom] = 0;
  }

  if (!roomUserNames[data.newRoom]) {
    roomUserNames[data.newRoom] = [];
  }

  roomUsers[data.newRoom]++;

  roomUserNames[data.newRoom].push(
    socket.userData.name
  );

  io.to(data.newRoom).emit(
    "update_users",
    {
      users: roomUserNames[data.newRoom],
    }
  );

  io.to(data.newRoom).emit(
    "online_users",
    roomUsers[data.newRoom]
  );

  io.to(data.newRoom).emit(
    "user_joined",
    {
      message: `${socket.userData.name} joined ${data.newRoom}`,
    }
  );
});

  socket.on("disconnect", () => {
    if (socket.userData) {
      const room =
        socket.userData.room;

      roomUsers[room]--;

      roomUserNames[room] =
        roomUserNames[room].filter(
          (user) =>
            user !==
            socket.userData.name
        );

      io.to(room).emit("update_users", {
        users: roomUserNames[room],
      });

      io.to(room).emit("user_left", {
        message: `${socket.userData.name} left the room`,
      });

      io.to(room).emit(
        "online_users",
        roomUsers[room]
      );
    }

    console.log(
      "User Disconnected:",
      socket.id
    );
  });
});

server.listen(3001, () => {
  console.log(
    "Server Running on port 3001"
  );
});