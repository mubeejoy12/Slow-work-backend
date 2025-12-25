import { FastifyInstance } from "fastify";
import { z } from "zod";
import { SessionBooking } from "../models/SessionBooking";
import { User } from "../models/User";

const createBookingSchema = z.object({
  hostId: z.string(),
  startTime: z.string().datetime() // ISO string
});

export async function bookingRoutes(app: FastifyInstance) {
  // create a booking (guest → host)
  app.post(
    "/bookings",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      if (!req.user) {
        return reply.code(401).send({ error: "Unauthorized" });
      }

      const parsed = createBookingSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "Invalid data" });
      }

      const { hostId, startTime } = parsed.data;

      // ensure host exists and is a host
      const host = await User.findById(hostId);
      if (!host || host.role !== "host") {
        return reply.code(400).send({ error: "Host not found" });
      }

      const booking = await SessionBooking.create({
        hostId,
        guestId: req.user.userId,
        startTime: new Date(startTime),
        status: "pending"
      });

      return { booking };
    }
  );

  // list my bookings (as host or guest)
  app.get(
    "/bookings/me",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      if (!req.user) {
        return reply.code(401).send({ error: "Unauthorized" });
      }

      const userId = req.user.userId;

      const bookings = await SessionBooking.find({
        $or: [{ hostId: userId }, { guestId: userId }]
      })
        .sort({ startTime: 1 })
        .lean();

      return { bookings };
    }
  );
}
