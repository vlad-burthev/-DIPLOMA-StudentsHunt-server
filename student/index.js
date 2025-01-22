import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import { configDotenv } from "dotenv";

import passport from "passport";
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

const start = async () => {
  try {
    await client.connect();
    console.log("[Student]: Connected to the database");

    app.listen(PORT, () =>
      console.log(`[Student]: server started on PORT: ${PORT}`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
