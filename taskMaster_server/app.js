import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// import mongoose from "mongoose";
import { ConnectDB } from "./config/database.js";

import taskRouter from "./routes/task.js";
import authRouter from './routes/auth.js'
// error handlers
import errorHandlerMiddleware from "./middleware/error-handler.js";
import NotFoundError from "./middleware/not-found.js";
import { StatusCodes } from "http-status-codes";

dotenv.config();

const app = express();

app.use(express.json());
// app.use(cors());
app.use(cors({
  origin: 'https://taskmaster-1-2qtf.onrender.com' // Vercel URL
}));

// "Emergency Logger": It will print every request your server receives to the terminal:
// app.use((req, res, next) => {
//   console.log(`${req.method} request to ${req.url}`);
//   next();
// });

// Routings address
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/auth", authRouter);

// middleware
app.use(errorHandlerMiddleware);
app.use(NotFoundError);

const port = process.env.PORT || 8000;

// database Connection
ConnectDB().then(() => {
  app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Something went wrong on our end!" });
});