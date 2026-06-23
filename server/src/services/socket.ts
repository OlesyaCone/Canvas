import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Group from "../models/Group";
import User from "../models/User";

let io: Server;

export const setupSocket = (server: HttpServer) => {
  io = new Server(server, {
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
      socket.join(decoded.id);
      next();
    } catch {
      next(new Error("Неверный токен"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("joinGroup", (groupId: string) => socket.join(groupId));
    socket.on("leaveGroup", (groupId: string) => socket.leave(groupId));

    socket.on(
      "sendMessage",
      async (data: { groupId: string; text: string }) => {
        const group = await Group.findById(data.groupId);
        if (!group) return;
        group.messages.push({ user: (socket as any).userId, text: data.text });
        await group.save();
        const populated = await Group.findById(data.groupId).populate(
          "messages.user",
          "username avatar",
        );
        if (!populated) return;
        const msg = populated.messages[populated.messages.length - 1];
        io.to(data.groupId).emit("newMessage", msg);
      },
    );
  });
};

export const emitNotification = async (userId: string, notification: any) => {
  const user = await User.findById(userId).populate(
    "notifications.from",
    "username avatar",
  );
  if (!user) return;
  const notif = user.notifications[user.notifications.length - 1];
  io.to(userId).emit("newNotification", notif);
};
