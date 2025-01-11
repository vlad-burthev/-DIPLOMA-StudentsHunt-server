import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";

configDotenv();

const app = express();
app.use(cors());
app.use(express.json());
// app.use('api')

const start = async () => {
  try {
    app.listen(8888, () => console.log("server started"));
  } catch (error) {
    console.log(error);
  }
};

start();
