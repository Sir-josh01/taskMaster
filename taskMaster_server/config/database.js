import mongoose from "mongoose";

export const ConnectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI),
      {
        serverSelectionTimeoutMS: 5000, // Fail fast (5s)
      };
    console.log("✅ TaskMaster Database Connected");
  } catch (error) {
    console.error(
      "Critical: Could not connect to DB, Check the database connection bruv!"
    );
    console.log("❌ Connection Error:", error);
    process.exit(1); // Stop the server if DB fails
  }
};
