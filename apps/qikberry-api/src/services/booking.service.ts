import { BookingModel, EventModel, LogModel } from '../models/dbmodels';
import { sequelize } from '../config/db'
import { AppError } from '../utils';

const safeLog = async (payload: Record<string, any>) => {
  try {
    await LogModel.create(payload);
  } catch {
    // logging must never break the main flow
  }
};

export const bookTicket = async (input: { eventId: string; ticketCount: number }, userId: number) => {
  const ticketCount = Number(input.ticketCount || 1);

  const reserved = await EventModel.findOneAndUpdate(
    { _id: input.eventId, availableTickets: { $gte: ticketCount } },
    { $inc: { availableTickets: -ticketCount } },
    { new: true }
  );

  if (!reserved) {
    throw new AppError('Tickets unavailable', 409);
  }

  const tx = await sequelize.transaction();

  try {
    const booking = await BookingModel.create(
      {
        userId,
        eventId: String(input.eventId),
        ticketCount,
        status: 'confirmed'
      },
      { transaction: tx }
    );

    await tx.commit();

    await safeLog({
      level: 'info',
      action: 'BOOK_TICKET',
      message: `Booking confirmed for event ${input.eventId}`,
      userId,
      eventId: String(input.eventId),
      meta: { bookingId: booking.id, ticketCount }
    });

    return booking;
  } catch (error: any) {
    await tx.rollback();
    await EventModel.updateOne({ _id: input.eventId }, { $inc: { availableTickets: ticketCount } });

    await safeLog({
      level: 'error',
      action: 'BOOK_TICKET_FAILED',
      message: `Booking failed for event ${input.eventId}`,
      userId,
      eventId: String(input.eventId),
      meta: { error: error?.message || 'Unknown error', ticketCount }
    });

    throw error;
  }
};

export const myTickets = async (userId: number) => {
  const bookings = await BookingModel.findAll({
    where: { userId },
    order: [['bookedAt', 'DESC']],
    raw: true
  });

  const eventIds = [...new Set(bookings.map((booking: any) => String(booking.eventId)))];

  const events = await EventModel.find({ _id: { $in: eventIds } })
    .select('title date location')
    .lean();

  const eventMap = new Map(events.map((event: any) => [String(event._id), event]));

  const items = bookings.map((booking: any) => {
    const event = eventMap.get(String(booking.eventId));
    return {
      id: booking.id,
      eventId: booking.eventId,
      eventTitle: event?.title || null,
      eventDate: event?.date || null,
      eventLocation: event?.location || null,
      ticketCount: booking.ticketCount,
      status: booking.status,
      bookedAt: booking.bookedAt
    };
  });

  return {
    count: items.length,
    items
  };
};
