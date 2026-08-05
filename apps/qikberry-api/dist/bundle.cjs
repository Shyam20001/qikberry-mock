"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/main.ts
var import_dotenv2 = __toESM(require("dotenv"));

// src/app.ts
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
var import_yaml = __toESM(require("yaml"));
var import_swagger_ui_express = __toESM(require("swagger-ui-express"));
var import_express2 = __toESM(require("express"));
var import_helmet = __toESM(require("helmet"));
var import_cors = __toESM(require("cors"));
var import_express_rate_limit = __toESM(require("express-rate-limit"));

// src/routes.ts
var import_express = require("express");

// src/middleware.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var import_zod = require("zod");

// src/utils.ts
var AppError = class extends Error {
  statusCode;
  details;
  isOperational;
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
};
var asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
var sanitizeDeep = (value) => {
  const blocked = /* @__PURE__ */ new Set(["__proto__", "constructor", "prototype"]);
  if (Array.isArray(value)) return value.map(sanitizeDeep);
  if (value && typeof value === "object" && value.constructor === Object) {
    const out = {};
    for (const [key, entry] of Object.entries(value)) {
      if (blocked.has(key) || typeof entry === "function" || entry === void 0) continue;
      out[key] = sanitizeDeep(entry);
    }
    return out;
  }
  if (typeof value === "string") return value.trim();
  return value;
};

// src/middleware.ts
var getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError("JWT_SECRET is not configured", 500);
  }
  return secret;
};
var auth = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new AppError("Missing or invalid token", 401));
  }
  try {
    const token = header.split(" ")[1];
    req.user = import_jsonwebtoken.default.verify(token, getJwtSecret());
    next();
  } catch {
    next(new AppError("Token invalid or expired", 401));
  }
};
var requireAdmin = (req, _res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return next(new AppError("Admin access required", 403));
  }
  next();
};
var validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    if (parsed.body !== void 0) req.body = parsed.body;
    req.validated = parsed;
    res.locals.validated = parsed;
    next();
  } catch (error) {
    if (error instanceof import_zod.ZodError) {
      return next(
        new AppError("Validation failed", 400, {
          issues: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
          }))
        })
      );
    }
    next(error);
  }
};
var notFound = (_req, _res, next) => {
  next(new AppError("Route not found", 404));
};
var errorHandler = (err, _req, res, _next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    details: err.details || null
  });
};

// src/models/dbmodels.ts
var import_mongoose2 = __toESM(require("mongoose"));
var import_sequelize2 = require("sequelize");

// src/config/db.ts
var import_dotenv = __toESM(require("dotenv"));
var import_mongoose = __toESM(require("mongoose"));
var import_sequelize = require("sequelize");
import_dotenv.default.config();
var sequelize = new import_sequelize.Sequelize(
  process.env.MYSQL_DATABASE || "event_ticket_system",
  process.env.MYSQL_USER || "root",
  process.env.MYSQL_PASSWORD || "",
  {
    host: process.env.MYSQL_HOST || "localhost",
    port: Number(process.env.MYSQL_PORT || 3306),
    dialect: "mysql",
    logging: false,
    timezone: "+05:30"
  }
);

// src/models/dbmodels.ts
var UserModel = sequelize.define(
  "User",
  {
    id: {
      type: import_sequelize2.DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: import_sequelize2.DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: import_sequelize2.DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    password: {
      type: import_sequelize2.DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: import_sequelize2.DataTypes.ENUM("user", "admin"),
      allowNull: false,
      defaultValue: "user"
    }
  },
  {
    tableName: "users",
    underscored: true,
    timestamps: true
  }
);
UserModel.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};
var BookingModel = sequelize.define(
  "Booking",
  {
    id: {
      type: import_sequelize2.DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: import_sequelize2.DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: "user_id"
    },
    eventId: {
      type: import_sequelize2.DataTypes.CHAR(24),
      allowNull: false,
      field: "event_id"
    },
    ticketCount: {
      type: import_sequelize2.DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      field: "ticket_count"
    },
    status: {
      type: import_sequelize2.DataTypes.ENUM("confirmed", "cancelled"),
      allowNull: false,
      defaultValue: "confirmed"
    },
    bookedAt: {
      type: import_sequelize2.DataTypes.DATE,
      allowNull: false,
      defaultValue: import_sequelize2.DataTypes.NOW,
      field: "booked_at"
    }
  },
  {
    tableName: "bookings",
    underscored: true,
    timestamps: true
  }
);
var EventSchema = new import_mongoose2.default.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5e3
    },
    date: {
      type: Date,
      required: true
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255
    },
    totalTickets: {
      type: Number,
      required: true,
      min: 0
    },
    availableTickets: {
      type: Number,
      required: true,
      min: 0
    },
    metadata: {
      type: import_mongoose2.default.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);
EventSchema.index({ date: 1 });
EventSchema.index({ title: 1 });
var EventModel = import_mongoose2.default.model("Event", EventSchema);
var LogSchema = new import_mongoose2.default.Schema(
  {
    level: {
      type: String,
      enum: ["info", "warn", "error"],
      required: true,
      default: "info"
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    userId: {
      type: Number,
      default: null
    },
    eventId: {
      type: String,
      default: null
    },
    meta: {
      type: import_mongoose2.default.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);
LogSchema.index({ createdAt: -1 });
var LogModel = import_mongoose2.default.model("Log", LogSchema);

// src/services/event.service.ts
var safeLog = async (payload) => {
  try {
    await LogModel.create(payload);
  } catch {
  }
};
var createEvent = async (input, actorUserId) => {
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
    level: "info",
    action: "CREATE_EVENT",
    message: `Event created: ${event.title}`,
    userId: actorUserId,
    eventId: String(event._id)
  });
  return event;
};
var listEvents = async (page = 1, limit = 10) => {
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

// src/services/booking.service.ts
var safeLog2 = async (payload) => {
  try {
    await LogModel.create(payload);
  } catch {
  }
};
var bookTicket = async (input, userId) => {
  const ticketCount = Number(input.ticketCount || 1);
  const reserved = await EventModel.findOneAndUpdate(
    { _id: input.eventId, availableTickets: { $gte: ticketCount } },
    { $inc: { availableTickets: -ticketCount } },
    { new: true }
  );
  if (!reserved) {
    throw new AppError("Tickets unavailable", 409);
  }
  const tx = await sequelize.transaction();
  try {
    const booking = await BookingModel.create(
      {
        userId,
        eventId: String(input.eventId),
        ticketCount,
        status: "confirmed"
      },
      { transaction: tx }
    );
    await tx.commit();
    await safeLog2({
      level: "info",
      action: "BOOK_TICKET",
      message: `Booking confirmed for event ${input.eventId}`,
      userId,
      eventId: String(input.eventId),
      meta: { bookingId: booking.id, ticketCount }
    });
    return booking;
  } catch (error) {
    await tx.rollback();
    await EventModel.updateOne({ _id: input.eventId }, { $inc: { availableTickets: ticketCount } });
    await safeLog2({
      level: "error",
      action: "BOOK_TICKET_FAILED",
      message: `Booking failed for event ${input.eventId}`,
      userId,
      eventId: String(input.eventId),
      meta: { error: error?.message || "Unknown error", ticketCount }
    });
    throw error;
  }
};
var myTickets = async (userId) => {
  const bookings = await BookingModel.findAll({
    where: { userId },
    order: [["bookedAt", "DESC"]],
    raw: true
  });
  const eventIds = [...new Set(bookings.map((booking) => String(booking.eventId)))];
  const events = await EventModel.find({ _id: { $in: eventIds } }).select("title date location").lean();
  const eventMap = new Map(events.map((event) => [String(event._id), event]));
  const items = bookings.map((booking) => {
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

// src/services/auth.service.ts
var import_bcryptjs = __toESM(require("bcryptjs"));
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
var signToken = (user) => import_jsonwebtoken2.default.sign(
  { id: Number(user.id), email: user.email, role: user.role },
  process.env.JWT_SECRET || "secret",
  { expiresIn: process.env.JWT_EXPIRES_IN || "2h" }
);
var registerUser = async (input) => {
  const existing = await UserModel.findOne({ where: { email: input.email } });
  if (existing) throw new AppError("Email already registered", 409);
  const hashed = await import_bcryptjs.default.hash(input.password, 10);
  const user = await UserModel.create({
    name: input.name,
    email: input.email,
    password: hashed,
    role: "user"
  });
  return {
    token: signToken(user),
    user: user.toJSON()
  };
};
var loginUser = async (input) => {
  const user = await UserModel.findOne({ where: { email: input.email } });
  if (!user) throw new AppError("Invalid credentials", 401);
  const ok = await import_bcryptjs.default.compare(input.password, user.password);
  if (!ok) throw new AppError("Invalid credentials", 401);
  return {
    token: signToken(user),
    user: user.toJSON()
  };
};

// src/controllers.ts
var register = asyncHandler(async (req, res) => {
  const input = sanitizeDeep(req.body);
  const result = await registerUser(input);
  res.status(201).json({ success: true, ...result });
});
var login = asyncHandler(async (req, res) => {
  const input = sanitizeDeep(req.body);
  const result = await loginUser(input);
  res.json({ success: true, ...result });
});
var createEventController = asyncHandler(async (req, res) => {
  const input = sanitizeDeep(req.body);
  const event = await createEvent(input, Number(req.user.id));
  res.status(201).json({ success: true, event });
});
var listEventsController = asyncHandler(async (req, res) => {
  const result = await listEvents(Number(req.query.page), Number(req.query.limit));
  res.json({ success: true, ...result });
});
var bookTicketController = asyncHandler(async (req, res) => {
  const input = sanitizeDeep(req.body);
  const booking = await bookTicket(input, Number(req.user.id));
  res.status(201).json({ success: true, booking });
});
var myTicketsController = asyncHandler(async (req, res) => {
  const result = await myTickets(Number(req.user.id));
  res.json({ success: true, ...result });
});

// src/validators.ts
var import_zod2 = require("zod");
var objectValue = import_zod2.z.record(import_zod2.z.string(), import_zod2.z.any());
var registerSchema = import_zod2.z.object({
  body: import_zod2.z.object({
    name: import_zod2.z.string().trim().min(2, "Name is required").max(100),
    email: import_zod2.z.string().trim().email("Email is invalid").transform((v) => v.toLowerCase()),
    password: import_zod2.z.string().min(8, "Password must be at least 8 characters")
  })
});
var loginSchema = import_zod2.z.object({
  body: import_zod2.z.object({
    email: import_zod2.z.string().trim().email("Email is invalid").transform((v) => v.toLowerCase()),
    password: import_zod2.z.string().min(1, "Password is required")
  })
});
var createEventSchema = import_zod2.z.object({
  body: import_zod2.z.object({
    title: import_zod2.z.string().trim().min(2, "Title is required").max(200),
    description: import_zod2.z.string().trim().min(5, "Description is required").max(5e3),
    date: import_zod2.z.coerce.date(),
    location: import_zod2.z.string().trim().min(2, "Location is required").max(255),
    totalTickets: import_zod2.z.coerce.number().int("totalTickets must be an integer").min(1, "totalTickets must be at least 1"),
    metadata: objectValue.optional().default({})
  })
});
var listEventsSchema = import_zod2.z.object({
  query: import_zod2.z.object({
    page: import_zod2.z.coerce.number().int().min(1).optional().default(1),
    limit: import_zod2.z.coerce.number().int().min(1).max(100).optional().default(10)
  })
});
var bookTicketSchema = import_zod2.z.object({
  body: import_zod2.z.object({
    eventId: import_zod2.z.string().trim().regex(/^[a-f\d]{24}$/i, "eventId must be a valid Mongo ObjectId"),
    ticketCount: import_zod2.z.coerce.number().int().min(1).max(10).optional().default(1)
  })
});

// src/routes.ts
var router = (0, import_express.Router)();
router.post("/auth/register", validate(registerSchema), register);
router.post("/auth/login", validate(loginSchema), login);
router.get("/events", validate(listEventsSchema), listEventsController);
router.post("/events", auth, requireAdmin, validate(createEventSchema), createEventController);
router.post("/bookings/book", auth, validate(bookTicketSchema), bookTicketController);
router.get("/bookings/my-tickets", auth, myTicketsController);
var routes_default = router;

// src/app.ts
var app = (0, import_express2.default)();
app.use((0, import_helmet.default)());
app.use(
  (0, import_cors.default)({
    origin: (process.env.CORS_ORIGIN || "*").split(",").map((value) => value.trim()),
    credentials: true
  })
);
app.use(import_express2.default.json({ limit: "10kb" }));
app.use(import_express2.default.urlencoded({ extended: true, limit: "10kb" }));
app.use(
  (0, import_express_rate_limit.default)({
    windowMs: 15 * 60 * 1e3,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false
  })
);
if (process.env.NODE_ENV === "development") {
  const openApiPath = import_path.default.join(process.cwd(), "openapi.yaml");
  const openApiDoc = import_yaml.default.parse(import_fs.default.readFileSync(openApiPath, "utf8"));
  app.use("/docs", import_swagger_ui_express.default.serve, import_swagger_ui_express.default.setup(openApiDoc));
}
app.get("/healthz", (_req, res) => {
  res.json({ success: true, message: "OK" });
});
app.use("/api", routes_default);
app.use(notFound);
app.use(errorHandler);
var app_default = app;

// src/main.ts
import_dotenv2.default.config();
var PORT = Number(process.env.PORT || 5e3);
var start = async () => {
  app_default.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};
start().catch((error) => {
  console.error("Startup failed:", error);
  process.exit(1);
});
//# sourceMappingURL=bundle.cjs.map
