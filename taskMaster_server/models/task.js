import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required:[true, 'A task name is required'],
    trim: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum:['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-Progress', 'completed'],
    default: 'pending'
  },
  // isCompleted: { 
  //   type: Boolean,
  //    default: false
  // },
  dueDate: {
    type: Date,
    required: [true, "A Due date (deadline) is required"]
  },
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a user'],
  },
},
  { timestamps: true });


export const Task = mongoose.model('Task', taskSchema);