import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema({
    coordinates: {
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    },
    address: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        }
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const UserSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    preferences: {
        dietaryValue: {
            type: String,
            default: null
        },
        priceValue: {
            type: String,
            default: null
        },
        cuisineValue: {
            type: String,
            default: null
        },
        includeParking: {
            type: Boolean,
            default: false
        },
        includeTransport: {
            type: Boolean,
            default: false
        }
    },
    locations: [LocationSchema],
    pushToken: {
        type: String,
        default: null,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

export const User = mongoose.model("User", UserSchema);