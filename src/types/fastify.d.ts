import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user?: {
      userId: string;
      role: "host" | "guest" | "admin";
    };
  }
}
