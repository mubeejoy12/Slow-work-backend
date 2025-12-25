import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
// import fp from "fastify-plugin";
import fp from "fastify-plugin";
import { verifyToken } from "../utils/jwt";

async function authPlugin(app: FastifyInstance) {
  app.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return reply.code(401).send({ error: "Missing token" });
      }

      const token = authHeader.substring("Bearer ".length);

      try {
        const payload = verifyToken(token);
        request.user = {
          userId: payload.userId,
          role: payload.role
        };
      } catch {
        return reply.code(401).send({ error: "Invalid token" });
      }
    }
  );
}

export default fp(authPlugin);

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}
