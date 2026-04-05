"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var ShipmentStatus;
(function (ShipmentStatus) {
    ShipmentStatus["DRAFT"] = "draft";
    ShipmentStatus["QUOTE_GENERATED"] = "quote_generated";
    ShipmentStatus["PENDING_PAYMENT"] = "pending_payment";
    ShipmentStatus["PAID"] = "paid";
    ShipmentStatus["PICKUP_SCHEDULED"] = "pickup_scheduled";
    ShipmentStatus["PICKED_UP"] = "picked_up";
    ShipmentStatus["AT_ORIGIN_HUB"] = "at_origin_hub";
    ShipmentStatus["IN_TRANSIT"] = "in_transit";
    ShipmentStatus["CUSTOMS_PROCESSING"] = "customS_processing";
    ShipmentStatus["AT_DESTINATION_HUB"] = "at_destination_hub";
    ShipmentStatus["OUT_FOR_DELIVERY"] = "out_for_delivery";
    ShipmentStatus["DELIVERED"] = "delivered";
    ShipmentStatus["DELIVERY_FAILED"] = "delivery_failed";
    ShipmentStatus["RETURNED"] = "returned";
    ShipmentStatus["CANCELLED"] = "cancelled";
})(ShipmentStatus || (exports.ShipmentStatus = ShipmentStatus = {}));
const ShipmentSchema = new mongoose_1.Schema({
    trackingNumber: { type: String, required: true, unique: true, index: true },
    sender: {
        name: { type: String, required: true },
        email: { type: String },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        country: { type: String, required: true }
    },
    receiver: {
        name: { type: String, required: true },
        email: { type: String },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        country: { type: String, required: true }
    },
    parcels: [{
            weight: { type: Number, required: true },
            dimensions: {
                length: { type: Number, required: true },
                width: { type: Number, required: true },
                height: { type: Number, required: true }
            },
            description: { type: String },
            declaredValue: { type: Number, default: 0 }
        }],
    status: { type: String, enum: Object.values(ShipmentStatus), default: ShipmentStatus.DRAFT },
    type: { type: String, enum: ['domestic', 'international'], default: 'domestic' },
    totalWeight: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    orgId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization' },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    estimatedDelivery: { type: Date },
    paymentType: { type: String, enum: ['prepaid', 'cod'], default: 'prepaid' },
    codAmount: { type: Number, default: 0 },
    codStatus: { type: String, enum: ['pending', 'collected', 'remitted'], default: 'pending' },
    pod: {
        image: { type: String },
        signature: { type: String },
        timestamp: { type: Date }
    }
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model('Shipment', ShipmentSchema);
