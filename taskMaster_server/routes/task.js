import express from "express";
const router = express.Router();
import authenticateUser from '../middleware/authentication.js'

import {
  getAllTasks,
  createTask,
  getSingleTask,
  updateTask,
  deleteTask,
  
} from "../controllers/tasks.js";

// This one line protects ALL routes below it
router.use(authenticateUser);

router.route('/').get(getAllTasks).post(createTask);
router.route('/:id').get(getSingleTask).patch(updateTask).delete(deleteTask)



export default router;
