import fastify from "fastify";
import mongoose from "mongoose";
import { PORT, MONGO_URI } from "./config/env";
import { authRoutes } from "./routes/auth"; 

const app = fastify({ logger: true });

app.get("/health", async () => {
  return { status: "ok" };
});

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
