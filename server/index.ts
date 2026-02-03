import express, { Express } from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import router from "./router/index";
import errorMiddleware from "./middlewares/error-middleware";
import dotenv from "dotenv";

dotenv.config();

const PORT: number = Number(process.env.PORT) || 5000;
const DB_URL: string = process.env.DB_URL || "";

const app: Express = express();

const corsOptions: CorsOptions = {
  credentials: true,
  origin: process.env.CLIENT_URL || "http://localhost:3000",
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use("/api", router);
app.use(errorMiddleware);

const start = async (): Promise<void> => {
  try {
    await mongoose.connect(DB_URL);

    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error("Server start error:", e.message);
    } else {
      console.error("Unknown server start error:", e);
    }
  }
};

mongoose.set("strictQuery", false);

start();
