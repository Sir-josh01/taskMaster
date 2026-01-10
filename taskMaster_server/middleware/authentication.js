import jwt from'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';

const auth = async (req, res, next) => {
  // Check for the Header (Authorization: Bearer <token>)
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Authentication invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach the user to the request object
    req.user = { userId: payload.userId, name: payload.name };
    
    next(); // Pass control to the next function (the Task Controller)
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Authentication invalid' });
  }
};

export default auth;