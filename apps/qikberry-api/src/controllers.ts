import { asyncHandler, sanitizeDeep } from './utils';
import { createEvent, listEvents } from './services/event.service';
import { bookTicket, myTickets } from './services/booking.service';
import { loginUser, registerUser } from './services/auth.service';

export const register = asyncHandler(async (req: any, res: any) => {
  const input = sanitizeDeep(req.body);
  const result = await registerUser(input);
  res.status(201).json({ success: true, ...result });
});

export const login = asyncHandler(async (req: any, res: any) => {
  const input = sanitizeDeep(req.body);
  const result = await loginUser(input);
  res.json({ success: true, ...result });
});

export const createEventController = asyncHandler(async (req: any, res: any) => {
  const input = sanitizeDeep(req.body);
  const event = await createEvent(input, Number(req.user.id));
  res.status(201).json({ success: true, event });
});

export const listEventsController = asyncHandler(async (req: any, res: any) => {
  const result = await listEvents(Number(req.query.page), Number(req.query.limit));
  res.json({ success: true, ...result });
});

export const bookTicketController = asyncHandler(async (req: any, res: any) => {
  const input = sanitizeDeep(req.body);
  const booking = await bookTicket(input, Number(req.user.id));
  res.status(201).json({ success: true, booking });
});

export const myTicketsController = asyncHandler(async (req: any, res: any) => {
  const result = await myTickets(Number(req.user.id));
  res.json({ success: true, ...result });
});
