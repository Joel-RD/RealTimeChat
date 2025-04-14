import express, {Response, Request} from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { config } from "../config.js";
import path from "path";
import { ExpressPeerServer } from "peer";
import { randomUUID } from "crypto";

const { PORT_SERVER, URL_LOCAL, console_log } = config;

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
  },
  maxHttpBufferSize: 1e8, //100mb
});

const peerServer = ExpressPeerServer(server, {
  // debug: true,
});

const absolutedRoot = path.join(process.cwd(), "src", "public");-

//Middlewares
app.use(express.static(absolutedRoot));
app.use("/peerjs", peerServer);

app.get("/video", (req: Request, res: Response) => {
  res.sendFile(absolutedRoot + "\\videostream.html");
});

let connectedUsers: Record<string, string> = {};
let waitingUsers: string[] = [];
let rooms: { roomId: string; users: string[] }[] = [];

io.on("connection", (socket) => {
  console_log("✅ Un usuario se ha conectado...");

  // Escuchar el identificador único del cliente
  socket.on("register", (userId):void => {
    if (!userId) {
      socket.emit("error", "Identificador de usuario no proporcionado.");
      socket.disconnect();
      return;
    }

    // Verificar si el usuario ya está conectado
    if (connectedUsers[userId]) {
      console_log(`⚠️ Usuario ${userId} ya está conectado.`);
      socket.emit("error", "Ya tienes una sesión activa.");
      socket.disconnect(); // Desconectar al usuario duplicado
      return;
    }

    // Registrar al usuario como conectado
    connectedUsers[userId] = socket.id;
    waitingUsers.push(socket.id);

    if (waitingUsers.length === 2) {
      const newRoom = `ROOM-${randomUUID()}`;
      const user1 = waitingUsers[0];
      const user2 = waitingUsers[1];

      io.sockets.sockets.get(user1).join(newRoom);
      io.sockets.sockets.get(user2).join(newRoom);

      // Guardar la sala en el registro de salas
      rooms.push({ roomId: newRoom, users: [user1, user2] });
      console_log(
        `🛋️ Sala creada: ${newRoom} con usuarios: ${user1}, ${user2}`
      );

      waitingUsers = [];
    }
  });

  socket.on("message", (message):void => {
    const userRoom = rooms.find((room) => room.users.includes(socket.id));
    if (userRoom) {
      socket.to(userRoom.roomId).emit("message", message);
    }
  });

  socket.on("image", (base64Image):void => {
    const userRoom = rooms.find((room) => room.users.includes(socket.id));
    if (userRoom) {
      socket.to(userRoom.roomId).emit("image", base64Image);
    }
  });

  // Manejo de señalización para WebRTC
  socket.on("webrtc-offer", (offer):void => {
    const userRoom = rooms.find((room) => room.users.includes(socket.id));
    if (userRoom) {
      socket.to(userRoom.roomId).emit("webrtc-offer", offer);
    }
  });

  socket.on("webrtc-answer", (answer):void => {
    const userRoom = rooms.find((room) => room.users.includes(socket.id));
    if (userRoom) {
      if (userRoom) {
        socket.to(userRoom.roomId).emit("webrtc-answer", answer);
      }
    }
  });

  socket.on("webrtc-ice-candidate", (candidate):void => {
    const userRoom = rooms.find((room) => room.users.includes(socket.id));
    if (userRoom) {
      socket.to(userRoom.roomId).emit("webrtc-ice-candidate", candidate);
    }
  });

  socket.on("call-ended", ():void => {
    const userRoom = rooms.find((room) => room.users.includes(socket.id));
    if (userRoom) {
      socket.to(userRoom.roomId).emit("call-ended");
    }
  });

  socket.on("disconnect", ():void => {
    console_log(`❌ Usuario ${socket.id} desconectado.`);

    // Eliminar al usuario del registro de conectados
    const userId = Object.keys(connectedUsers).find(
      (key) => connectedUsers[key] === socket.id
    );
    if (userId) {
      delete connectedUsers[userId];
    }

    const userRoom = rooms.find((room) => room.users.includes(socket.id));
    if (userRoom) {
      socket
        .to(userRoom.roomId)
        .emit("user-left", `Usuario a abandonado la sala...`);
    }

    waitingUsers = waitingUsers.filter((id) => id !== socket.id);

    rooms.forEach((room) => {
      room.users = room.users.filter((id) => id !== socket.id);
    });

    if (waitingUsers.length < 2) {
      console_log("🛋️ Se ha reiniciado la lista de espera por desconexión.");
    }
  });
});

server.listen(PORT_SERVER, ():void => {
  console_log(`Server on port ${PORT_SERVER}`);
  console_log(`URL: ` + URL_LOCAL + "" + PORT_SERVER);
});
