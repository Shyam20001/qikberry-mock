import { Router } from 'express';
import { auth, requireAdmin, validate } from './middleware';
import {
  bookTicketController,
  createEventController,
  listEventsController,
  login,
  myTicketsController,
  register
} from './controllers';
import { bookTicketSchema, createEventSchema, listEventsSchema, loginSchema, registerSchema } from './validators';

const router = Router();

router.post('/auth/register', validate(registerSchema), register);
router.post('/auth/login', validate(loginSchema), login);

router.get('/events', validate(listEventsSchema), listEventsController);
router.post('/events', auth, requireAdmin, validate(createEventSchema), createEventController);

router.post('/bookings/book', auth, validate(bookTicketSchema), bookTicketController);
router.get('/bookings/my-tickets', auth, myTicketsController);

export default router;
