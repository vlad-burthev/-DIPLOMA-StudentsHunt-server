import express from "express";
import cors from "cors";
import morgan from "morgan";

import { configDotenv } from "dotenv";
import { mainRouter } from "./app/router/index.js";

configDotenv();

const PORT = process.env.APP_PROT || 8000;

const app = express();
app.use(morgan("combined"));
app.use(cors());
app.use(express.json());
app.use("/api", mainRouter);
//test git actions

const start = async () => {
  try {
    app.listen(PORT, () => console.log(`server started on PORT: ${PORT}`));
  } catch (error) {
    console.log(error);
  }
};

start();
