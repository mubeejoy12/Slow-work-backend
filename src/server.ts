import fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import mongoose from "mongoose";
import { PORT, MONGO_URI } from "./config/env";
import { authRoutes } from "./routes/auth";
import authPlugin from "./plugins/authPlugin";
import { userRoutes } from "./routes/user";
import { bookingRoutes } from "./routes/booking";



const app: FastifyInstance = fastify({ logger: true });

app.register(authPlugin);
app.register(userRoutes);
app.register(bookingRoutes);
// Health check: verify server + MongoDB
app.get("/health", async () => {
  const mongoState = mongoose.connection.readyState; // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting

  return {
    status: mongoState === 1 ? "ok" : "degraded",
    mongo: {
      readyState: mongoState,
    },
  };
});

// Central error handler
app.setErrorHandler(
  async (error: Error, _request: FastifyRequest, reply: FastifyReply) => {
    // Log full error for operators
    app.log.error(error);

    // Hide internal details from clients
    const statusCode =
      reply.statusCode && reply.statusCode >= 400 ? reply.statusCode : 500;

    return reply.status(statusCode).send({
      message: statusCode === 500 ? "Internal server error" : error.message,
    });
  }
);

app.register(authRoutes);

async function start() {
  try {
    if (!MONGO_URI) {
      app.log.error("MONGO_URI is not set");
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    app.log.info("Connected to MongoDB");

    await app.listen({ port: Number(PORT), host: "0.0.0.0" });
    app.log.info(`Server listening on port ${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
