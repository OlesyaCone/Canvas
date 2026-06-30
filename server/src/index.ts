import mongoose from "mongoose";
import { createServer } from "http";
import app from "./app";
import { setupSocket } from "./services/socket";

const server = createServer(app);
const PORT = process.env.PORT || 5000;

setupSocket(server);

mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => console.log("MongoDB подключена"))
  .catch((err) => {
    console.error("Ошибка MongoDB:", err.message);
    process.exit(1);
  });

server.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Сервер запущен: http://0.0.0.0:${PORT}`);
});
