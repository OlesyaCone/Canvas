import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { createServer } from "http";
import { setupSocket } from "./services/socket";
import { setupRoutes } from "./routes/auth";
import { getFile } from "./controllers/upload";

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/uploads/:path(*)", getFile);
setupRoutes(app);
setupSocket(server);

mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => console.log("MongoDB подключена"))
  .catch((err) => {
    console.error("Ошибка MongoDB:", err.message);
    process.exit(1);
  });

server.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
