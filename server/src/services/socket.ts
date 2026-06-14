import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "../models/social/Message";

export const setupSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Не авторизован"));
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET as string,
      ) as { id: string };
      (socket as any).userId = decoded.id;
      next();
    } catch {
      next(new Error("Неверный токен"));
    }
  });

  io.on("connection", (socket) => {

    socket.on("joinGroup", (groupId: string) => {
      socket.join(groupId);
    });

    socket.on("leaveGroup", (groupId: string) => {
      socket.leave(groupId);
    });

    socket.on(
      "sendMessage",
      async (data: { groupId: string; text: string }) => {
        const message = await Message.create({
          group: data.groupId,
          user: (socket as any).userId,
          text: data.text,
        });
        await message.populate("user", "username avatar");
        io.to(data.groupId).emit("newMessage", message);
      },
    );
  });
};
