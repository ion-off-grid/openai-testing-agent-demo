import pino from "pino";
import fs from "fs";
import path from "path";

const isProduction = process.env.NODE_ENV === "production";

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configure main application logger
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        },
      }),
});

logger.info(`Logger initialized with log level: ${logger.level}`);

// Create a dedicated AI logger for model communication
// Define proper types for Pino logger options
type PinoLoggerOptions = pino.LoggerOptions & {
  name?: string;
  transport?: {
    target: string;
    options: {
      colorize: boolean;
      messageFormat: string;
    };
  };
};

// Initialize base logger options
let aiLoggerOptions: PinoLoggerOptions = {
  name: "ai-communication",
  level: process.env.AI_LOG_LEVEL || "info"
};

// Only configure transport for pretty printing when not logging to file
if (process.env.AI_LOG_TO_FILE !== "true" && !isProduction) {
  aiLoggerOptions = {
    ...aiLoggerOptions,
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        messageFormat: '{msg}'
      },
    }
  };
}

// Create appropriate destination based on configuration
const aiLoggerDestination = process.env.AI_LOG_TO_FILE === "true" 
  ? pino.destination(path.join(logsDir, "ai-communication.log"))
  : pino.destination(1); // stdout

// Create the logger with proper configuration
const aiLogger = pino(aiLoggerOptions, aiLoggerDestination);

aiLogger.info("AI communication logger initialized");

export { aiLogger };
export default logger;
