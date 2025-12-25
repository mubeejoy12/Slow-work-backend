import { FastifyInstance } from "fastify";
import { z } from "zod";
import { SessionBooking } from "../models/SessionBooking";
import { User } from "../models/User";

const createBookingSchema = z.object({
  hostId: z.string(),
  startTime: z.string().datetime() // ISO string
});

const updateStatusSchema = z.object({
  status: z.enum(["confirmed", "completed", "cancelled"])
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

      // prevent self-booking
      if (hostId === req.user.userId) {
        return reply.code(400).send({ error: "You cannot book yourself" });
      }

      // ensure host exists and is a host
      const host = await User.findById(hostId);
      if (!host || host.role !== "host") {
        return reply.code(400).send({ error: "Host not found" });
      }

      // ensure only guests can book (optional rule for now)
      if (req.user.role !== "guest") {
        return reply.code(403).send({ error: "Only guests can create bookings" });
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

  // update booking status (host only)
  app.patch(
    "/bookings/:id/status",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      if (!req.user) {
        return reply.code(401).send({ error: "Unauthorized" });
      }

      const parsed = updateStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "Invalid data" });
      }

      const bookingId = (req.params as any).id;
      const { status } = parsed.data;

      // only host of this booking can change status
      const booking = await SessionBooking.findById(bookingId);
      if (!booking) {
        return reply.code(404).send({ error: "Booking not found" });
      }

      if (booking.hostId.toString() !== req.user.userId) {
        return reply.code(403).send({ error: "Not allowed" });
      }

      booking.status = status;
      await booking.save();

      return { booking };
    }
  );
}
