import { StatusCodes } from "http-status-codes";

const errorHandlerMiddleware = (err, req, res, next) => {

  // Temporary debug line:
  console.log("FULL ERROR OBJECT:", err);


  let customError = {
    // set default
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || "Something went wrong try again later",
  };

  // if (err instanceof CustomAPIError) {
  //   return res.status(err.statusCode).json({ msg: err.message });
  // }

  // validation error type
  if (err.name === "ValidationError" && err.errors) {
    customError.message = Object.values(err.errors).map((item) => item.message).join(',');
    customError.statusCode = 400
  }

  // Duplicate error type
  if (err.code && err.code === 11000) {
    customError.message = `Duplicate value entered for ${Object.keys(err.keyValue)} field, please choose a different value`;
    customError.statusCode = 400;
  }

  // Cast error type
  if(err.name === "CastError") {
    customError.message = `No item found with id ${err.value}`
    customError.statusCode = 404
  }

  return res.status(500).json({ 
    message: err.message, 
    stack: err.stack, // This will show exactly which line failed in your browser
    raw: err 
  });
  
  return res
    .status(customError.statusCode)
    .json({ message: customError.message });
   
};

export default errorHandlerMiddleware;
