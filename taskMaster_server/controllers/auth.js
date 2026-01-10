import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { StatusCodes } from 'http-status-codes'
import { User } from '../models/user.js'
import { Task } from '../models/task.js'
import BadRequestError from '../errors/bad-request.js'
import NotFoundError from '../errors/not-found.js'

// Register new User
const register = async (req, res, next) => {
  try {
  const user = await User.create({...req.body});

  const token = jwt.sign({userId:user._id, name: user.name}, process.env.JWT_SECRET, {expiresIn: '2d'})
  res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token })
  } catch(error) {
    next(error); // Sends error to your errorHandlerMiddleware
  }
}

// Login Existing User
const login = async (req, res, next) => {
  const {email, password} = req.body;
  try {
  if(!email || !password) {
    throw new BadRequestError("Please provide an email and password");
  }
  const user = await User.findOne({email});
  if (!user) {
    throw new NotFoundError("User not found!! Invalid Credentials");
  }
  // password compare
  const isPasswordCorrect = await bcrypt.compare(password, user.password)
  if(!isPasswordCorrect) {
    throw new NotFoundError("Invaid Credentials!! with password")
  }

  const token = jwt.sign({ userId: user._id, name: user.name}, process.env.JWT_SECRET, {expiresIn: '2d'});

  res.status(StatusCodes.OK).json({user: { name: user.name }, token });
  }catch(error) {
    next(error);
  }
}

const deleteAccount = async (req, res) => {
  const userId = req.user.userId;

  // 1. Delete all tasks belonging to this user
  await Task.deleteMany({ createdBy: userId });

  // 2. Delete the user itself
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.status(StatusCodes.OK).json({ msg: 'Account and all associated tasks deleted.' });
}


export {register, login, deleteAccount}