import { EventModel, LogModel } from '../models/dbmodels';
import { AppError } from '../utils';

const safeLog = async (payload: Record<string, any>) => {
  try {
    await LogModel.create(payload);
  } catch {
    // logging must never break the main flow
  }
};

export const createEvent = async (
  input: {
    title: string;
    description: string;
    date: Date;
    location: string;
    totalTickets: number;
    metadata?: Record<string, any>;
  },
  actorUserId: number
) => {
  const event = await EventModel.create({
    title: input.title,
    description: input.description,
    date: input.date,
    location: input.location,
    totalTickets: input.totalTickets,
    availableTickets: input.totalTickets,
    metadata: input.metadata || {}
  });

  await safeLog({
    level: 'info',
    action: 'CREATE_EVENT',
    message: `Event created: ${event.title}`,
    userId: actorUserId,
    eventId: String(event._id)
  });

  return event;
};

export const listEvents = async (page = 1, limit = 10) => {
  const safePage = Math.max(Number(page || 1), 1);
  const safeLimit = Math.min(Math.max(Number(limit || 10), 1), 100);
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    EventModel.find().sort({ date: 1 }).skip(skip).limit(safeLimit).lean(),
    EventModel.countDocuments()
  ]);

  return {
    page: safePage,
    limit: safeLimit,
    total,
    items
  };
};
