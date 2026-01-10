import BadRequestError from "../errors/bad-request.js";
import NotFoundError from "../errors/not-found.js";
import { Task } from "../models/task.js";
import StatusCodes from "http-status-codes";

const getAllTasks = async (req, res) => {
  const tasks = await Task.find({createdBy: req.user.userId}).sort('-createdAt');
  // if(!tasks) {
  //   throw new NotFoundError('No task')
  // }
  return res.status(StatusCodes.OK).json({ tasks, count: tasks.length });
};

const createTask = async (req, res) => {
  // Link the task to the logged-in user
  req.body.createdBy = req.user.userId;

  // const { name, dueDate, priority, description, createdBy } = req.body;

  if (!req.body.name) {
    throw new BadRequestError("Title name is compulsory");
  }
  const newTask = await Task.create(req.body);
  res.status(StatusCodes.CREATED).json({ task: newTask});
};

const getSingleTask = async (req, res) => {
  const { id } = req.params;
  const task = await Task.findById(id);
  if (!task) {
    throw new NotFoundError(`No task exist with this ${id}`);
  }
  res.status(StatusCodes.OK).json({ task });
};

const updateTask = async (req, res) => {
  const { id } = req.params;
  const task = await Task.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true, // ensures the update follows your Schema rules
  });
  if (!task) {
    throw new NotFoundError(`No task with the id ${id}`);
  }
  res.status(StatusCodes.ACCEPTED).json({ task });
};

const deleteTask = async (req, res) => {
   const {id} = req.params;
  const deletedTask = await Task.findByIdAndDelete({_id:id, createdBy: req.user.userId});
  if (!deletedTask) {
    throw new NotFoundError(`NO task found with the id ${id}`);
  }
  res.status(StatusCodes.OK).json({message: 'Task deleted successfully'});
};


export {
  getAllTasks,
  createTask,
  getSingleTask,
  updateTask,
  deleteTask,
};
