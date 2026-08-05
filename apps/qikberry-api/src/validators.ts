import { z } from 'zod';

const objectValue = z.record(z.string(), z.any());

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name is required').max(100),
    email: z.string().trim().email('Email is invalid').transform((v) => v.toLowerCase()),
    password: z.string().min(8, 'Password must be at least 8 characters')
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Email is invalid').transform((v) => v.toLowerCase()),
    password: z.string().min(1, 'Password is required')
  })
});

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2, 'Title is required').max(200),
    description: z.string().trim().min(5, 'Description is required').max(5000),
    date: z.coerce.date(),
    location: z.string().trim().min(2, 'Location is required').max(255),
    totalTickets: z.coerce.number().int('totalTickets must be an integer').min(1, 'totalTickets must be at least 1'),
    metadata: objectValue.optional().default({})
  })
});

export const listEventsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10)
  })
});

export const bookTicketSchema = z.object({
  body: z.object({
    eventId: z.string().trim().regex(/^[a-f\d]{24}$/i, 'eventId must be a valid Mongo ObjectId'),
    ticketCount: z.coerce.number().int().min(1).max(10).optional().default(1)
  })
});
