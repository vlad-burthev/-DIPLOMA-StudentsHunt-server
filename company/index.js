import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import { configDotenv } from "dotenv";
import helmet from "helmet";
import morgan from "morgan";

import client from "./db.config.js";
import passport from "passport";
import "./app/strartegy/google.strategy.js";
import {
  errorHandler,
  responseHandler,
} from "../httpResponse/httpResponseHandler.middleware.js";
import router from "./app/router/main-router.js";

// Load environment variables
configDotenv();

const PORT = process.env.APP_PROT || 8001;

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan("dev")); // Logging

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

app.use("/api", router);
// app.use(adminRouter);

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
