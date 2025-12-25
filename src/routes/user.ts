import { FastifyInstance } from "fastify";
import { z } from "zod";
import { User } from "../models/User";

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  pricePerSession: z.number().min(0).max(1000).optional(),
  languages: z.array(z.string()).optional(),
  timezone: z.string().optional()
});

export async function userRoutes(app: FastifyInstance) {
  // get current user
  app.get("/me", { preHandler: [app.authenticate] }, async (req, reply) => {
    if (!req.user) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const user = await User.findById(req.user.userId).select(
      "name email role bio pricePerSession languages timezone"
    );

    if (!user) {
      return reply.code(404).send({ error: "User not found" });
    }

    return { user };
  });

  // update current user
  app.put("/me", { preHandler: [app.authenticate] }, async (req, reply) => {
    if (!req.user) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid data" });
    }

    const update = parsed.data;

    const user = await User.findByIdAndUpdate(req.user.userId, update, {
      new: true
    }).select("name email role bio pricePerSession languages timezone");

    if (!user) {
      return reply.code(404).send({ error: "User not found" });
    }

    return { user };
  });
}
