import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

const uri = process.env.MONGODB_URI;

let isConnected = false;

export const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  if (mongoose.connection.readyState === mongoose.ConnectionStates.connected) {
    isConnected = true;
    return;
  }

  try {
    await mongoose.connect(uri);
    isConnected = true;
  } catch (error) {
    throw new Error("Failed to connect to MongoDB");
  }
};
