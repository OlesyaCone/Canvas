import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { setupRoutes } from "./routes/auth";
import { getFile } from "./controllers/upload";

dotenv.config();
const app = express();

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

export default app;
