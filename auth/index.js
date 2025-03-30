import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import { configDotenv } from "dotenv";

import client from "./db.config.js";
import passport from "passport";
import "./app/strartegy/google.strategy.js";
import { mainRouter } from "./app/router/main-router.js";
import {
  errorHandler,
  responseHandler,
} from "./app/httpResponse/httpResponseHandler.middleware.js";

configDotenv();

const PORT = process.env.APP_PROT || 8001;

const app = express();
// app.use(morgan("combined"));

const corsOptions = {
  origin: "http://localhost:5173", // или массив разрешённых источников
  credentials: true, // разрешаем передачу куки
};

app.use(cors(corsOptions));
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

app.use("/api", mainRouter);

app.use(errorHandler);
app.use(responseHandler);

const start = async () => {
  try {
    await client
      .connect()
      .then(() => console.log("[Company]: Database connected!"))
      .catch((err) =>
        console.log("[Company]: Database connection failed:", err)
      );

    app.listen(PORT, () =>
      console.log(`[Company]: server started on PORT: ${PORT}`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
