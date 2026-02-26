import express, { Express } from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import router from "./router/index"; 
import errorMiddleware from "./middlewares/errorMiddleware";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL || "http://localhost:3000",
}));

app.use("/api", router);  
app.use(errorMiddleware);

app.get('/test-google', (req, res) => {
  res.json({ message: 'Сервер работает!' });
});

const start = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.DB_URL || "");
    app.listen(5000, () => {
      console.log(`Server started on port 5000`);
    });
  } catch (e) {
    console.error(e);
  }
};

start();