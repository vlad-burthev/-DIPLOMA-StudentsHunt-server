import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import { configDotenv } from "dotenv";
import passport from "passport";
import { WebSocketServer, WebSocket } from "ws";
import "./strartegy/google.strategy.js";
import client from "./db.config.js";

configDotenv();

const PORT = process.env.APP_PROT || 8002;

const app = express();
app.use(morgan("combined"));
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.CLIENT_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// app.use("/api", mainRouter);
// app.use(adminRouter);
// app.use(errorHandler);
// app.use(responseHandler);

// Создание WebSocket-сервера
const wss = new WebSocketServer({ noServer: true });
const clients = new Set();

// Обработка новых соединений WebSocket
wss.on("connection", (ws) => {
  console.log("Новое WebSocket соединение");
  clients.add(ws);

  ws.on("message", (message) => {
    console.log("Сообщение от клиента:", message.toString());
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log("Соединение закрыто");
  });
});

// WebSocket уведомление
export function broadcastMessage(data) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

const start = async () => {
  try {
    await client.connect();
    console.log("[Student]: Connected to the database");

    const server = app.listen(PORT, () =>
      console.log(`[Student]: Server started on PORT: ${PORT}`)
    );

    // Привязываем WebSocket-сервер к HTTP-серверу
    server.on("upgrade", (request, socket, head) => {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    });
  } catch (error) {
    console.log(error);
  }
};

start();
