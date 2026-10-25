import express from "express";
import { createServer } from "http";
import SocketService from "./services/socket.js";

async function init() {
  const app = express();
  const socketService = new SocketService();

  const server = createServer(app);

  app.use(express.json());
  const PORT = process.env.PORT || 8000;

  socketService.io.attach(server);
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
  socketService.initListener();
}

init();
