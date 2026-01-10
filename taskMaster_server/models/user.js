import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
    unique: true, // Prevents duplicate accounts
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
  },
});

// Hash the password before saving to database
UserSchema.pre('save', async function() {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt)
});

export const User = mongoose.model('User', UserSchema);