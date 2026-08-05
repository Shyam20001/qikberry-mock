import mongoose from 'mongoose';
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db';

export const UserModel = sequelize.define(
    'User',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('user', 'admin'),
            allowNull: false,
            defaultValue: 'user'
        }
    },
    {
        tableName: 'users',
        underscored: true,
        timestamps: true
    }
) as any;

UserModel.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
};

export const BookingModel = sequelize.define(
    'Booking',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            field: 'user_id'
        },
        eventId: {
            type: DataTypes.CHAR(24),
            allowNull: false,
            field: 'event_id'
        },
        ticketCount: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 1,
            field: 'ticket_count'
        },
        status: {
            type: DataTypes.ENUM('confirmed', 'cancelled'),
            allowNull: false,
            defaultValue: 'confirmed'
        },
        bookedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'booked_at'
        }
    },
    {
        tableName: 'bookings',
        underscored: true,
        timestamps: true
    }
) as any;

const EventSchema = new mongoose.Schema(
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
            maxlength: 5000
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
            type: mongoose.Schema.Types.Mixed,
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

export const EventModel = mongoose.model('Event', EventSchema);

const LogSchema = new mongoose.Schema(
    {
        level: {
            type: String,
            enum: ['info', 'warn', 'error'],
            required: true,
            default: 'info'
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
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

LogSchema.index({ createdAt: -1 });

export const LogModel = mongoose.model('Log', LogSchema);

export { sequelize };
