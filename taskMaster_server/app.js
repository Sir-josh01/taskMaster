import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// import mongoose from "mongoose";
import { ConnectDB } from "./config/database.js";

import taskRouter from "./routes/task.js";
import authRouter from './routes/auth.js';
import pushRouter from './routes/auth.js';


// error handlers
import errorHandlerMiddleware from "./middleware/error-handler.js";
import NotFoundError from "./middleware/not-found.js";
import { StatusCodes } from "http-status-codes";

dotenv.config();

const app = express();

// app.use(cors());
app.use(cors({
  origin: [
    'https://task-master-three-delta.vercel.app', 
    'https://task-master-e50abhcak-sir-josh01-projects.vercel.app', // Added the one from the error
    'http://localhost:5173'
  ],
  credentials: true // Vercel URL
}));

app.use(express.json());

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: "active", message: "Server is awake" });
});


// "Emergency Logger": It will print every request your server receives to the terminal:
// app.use((req, res, next) => {
//   console.log(`${req.method} request to ${req.url}`);
//   next();
// });

// Routings address
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/auth", authRouter);
app.use('/api/v1/push', pushRouter);

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

// for automatic alarm
import cron from 'cron';
import { Task } from './models/task.js';
import { Subscription } from './models/subscription.js';
import webPush from 'web-push';

// Cron job to check overdue every minute
const job = new cron.CronJob('* * * * *', async () => {
  console.log('Cron: Checking for overdue tasks...');
  const now = new Date();

  const overdueTasks = await Task.find({ dueDate: { $lt: now }, isCompleted: false });
console.log(`Cron: Found ${overdueTasks.length} overdue tasks`);
  for (const task of overdueTasks) {
    const sub = await Subscription.findOne({ userId: task.createdBy });

    if (sub) {
      console.log(`Sending push to user ${task.createdBy} for task "${task.name}"`);
      webPush.setVapidDetails(
        process.env.VAPID_SUBJECT,
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
      try {
      await webPush.sendNotification(sub.subscription, JSON.stringify({
        title: 'Task Overdue',
        body: `Your task "${task.name}" is overdue!`,
      }));
        console.log(`Push sent successfully for task: ${task.name}`);
      } catch (err) {
        console.error('Push send failed:', err);
      }
    } else {
      console.log(`No subscription found for user ${task.createdBy}`);
    }
  }
});

job.start();

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Something went wrong on our end!" });
});