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
exports.ComplaintPriority = exports.ComplaintStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var ComplaintStatus;
(function (ComplaintStatus) {
    ComplaintStatus["OPEN"] = "open";
    ComplaintStatus["IN_PROGRESS"] = "in_progress";
    ComplaintStatus["RESOLVED"] = "resolved";
    ComplaintStatus["CLOSED"] = "closed";
})(ComplaintStatus || (exports.ComplaintStatus = ComplaintStatus = {}));
var ComplaintPriority;
(function (ComplaintPriority) {
    ComplaintPriority["LOW"] = "low";
    ComplaintPriority["MEDIUM"] = "medium";
    ComplaintPriority["HIGH"] = "high";
    ComplaintPriority["URGENT"] = "urgent";
})(ComplaintPriority || (exports.ComplaintPriority = ComplaintPriority = {}));
const ComplaintSchema = new mongoose_1.Schema({
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: Object.values(ComplaintStatus), default: ComplaintStatus.OPEN },
    priority: { type: String, enum: Object.values(ComplaintPriority), default: ComplaintPriority.MEDIUM },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    shipmentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Shipment' },
    assignedTo: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    responses: [{
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
            message: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }]
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model('Complaint', ComplaintSchema);
