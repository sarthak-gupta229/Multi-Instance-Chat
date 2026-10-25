import { Server } from "socket.io";
import { Redis } from "ioredis";

const pub = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
});
const sub = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
});

class SocketService {
  public _io: Server;

  constructor() {
    sub.subscribe("MESSAGES");
    sub.on("message", (channel, msg) => {
      console.log(`Message received in ${channel} : `, msg);
    });
    console.log("Init Socket Service");
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });
  }

  public initListener() {
    const io = this.io;
    console.log("Init Socket Listener");
    io.on("connect", (socket) => {
      console.log("User Connected", socket.id);

      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log("User", `user_id : ${socket.id}`, `message : ${message}`);

        await pub.publish("MESSAGES", JSON.stringify({ message }));
      });
    });
    sub.on("message", (channel, msg) => {
      console.log(`Message received in ${channel} : `, msg);

      if (channel === "MESSAGES") {
        io.emit("message", msg);
      }
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
