const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const logger = require("../utils/logger");

// Support .env in either server/.env or project-root/.env
dotenv.config({ path: path.resolve(__dirname, "../.env") });
if (!process.env.MONGO_URI) {
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
}

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;

  try {
    if (!primaryUri) {
      throw new Error(
        "MONGO_URI is not set. Add it to server/.env or project-root/.env",
      );
    }

    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 8000,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    // If running locally, Docker DNS name "mongo" is not resolvable.
    if (error.code === "ENOTFOUND" && primaryUri.includes("://mongo:")) {
      const fallbackUri = primaryUri.replace("://mongo:", "://localhost:");

      try {
        mongoose.set("strictQuery", true);

        const conn = await mongoose.connect(fallbackUri, {
          serverSelectionTimeoutMS: 8000,
        });
        logger.info(`MongoDB connected via localhost fallback: ${conn.connection.host}`);
        return;
      } catch (fallbackError) {
        logger.error(`MongoDB fallback connection error: ${fallbackError.message}`);
      }
    }

    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
