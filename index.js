import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { configDotenv } from "dotenv";
import { mainRouter } from "./app/router/index.js";
import {
  errorHandler,
  responseHandler,
} from "./app/middlewares/httpResponseHandler.middleware.js";
import { dbConfig } from "./db.config.js";

configDotenv();

const PORT = process.env.APP_PROT || 8000;

const app = express();
app.use(morgan("combined"));

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api", mainRouter);

app.use(responseHandler);
app.use(errorHandler);

const start = async () => {
  try {
    await dbConfig.authenticate();
    await dbConfig.sync();

    app.listen(PORT, () => console.log(`server started on PORT: ${PORT}`));
  } catch (error) {
    console.log(error);
  }
};

start();
