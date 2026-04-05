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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importStar(require("../models/User"));
const Organization_1 = __importDefault(require("../models/Organization"));
const Shipment_1 = __importStar(require("../models/Shipment"));
const ShipmentEvent_1 = __importDefault(require("../models/ShipmentEvent"));
const Warehouse_1 = __importDefault(require("../models/Warehouse"));
dotenv_1.default.config();
const seedData = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/relayxpress');
        console.log('Connected to MongoDB for seeding...');
        // Clear existing data
        await User_1.default.deleteMany({});
        await Organization_1.default.deleteMany({});
        await Shipment_1.default.deleteMany({});
        await ShipmentEvent_1.default.deleteMany({});
        await Warehouse_1.default.deleteMany({});
        console.log('Old data cleared.');
        // Create Admin Organization
        const org = await Organization_1.default.create({
            name: 'RelayXpress Global',
            type: 'internal',
            contactEmail: 'hq@relayxpress.com',
            contactPhone: '+1-800-RELAY-XP',
            address: '10 Logistics Way, Global Port, SG',
            settings: { autoPickup: true }
        });
        // Create Users
        const admin = await User_1.default.create({
            name: 'System Admin',
            email: 'admin@relayxpress.com',
            password: 'password123',
            role: User_1.UserRole.ADMIN,
            orgId: org._id
        });
        const customer = await User_1.default.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            role: User_1.UserRole.CUSTOMER
        });
        const courier = await User_1.default.create({
            name: 'Speedy Rider',
            email: 'courier@relayxpress.com',
            password: 'password123',
            role: User_1.UserRole.COURIER
        });
        const warehouseOp = await User_1.default.create({
            name: 'Lagos Hub Manager',
            email: 'warehouse@relayxpress.com',
            password: 'password123',
            role: User_1.UserRole.WAREHOUSE_OP
        });
        const support = await User_1.default.create({
            name: 'Helpdesk Agent',
            email: 'support@relayxpress.com',
            password: 'password123',
            role: User_1.UserRole.SUPPORT
        });
        console.log('\n--- 🔑 Test Accounts Created ---');
        console.log('All passwords are: password123');
        console.log('Admin:       admin@relayxpress.com');
        console.log('Customer:    john@example.com');
        console.log('Courier:     courier@relayxpress.com');
        console.log('Warehouse:   warehouse@relayxpress.com');
        console.log('Support:     support@relayxpress.com');
        console.log('--------------------------------\n');
        // Create a Sample Shipment
        const shipment = await Shipment_1.default.create({
            trackingNumber: 'RX-2024-521901',
            sender: {
                name: 'Kigali Central Office',
                email: 'logistics@relayxpress.rw',
                phone: '+250-788-111-222',
                address: 'KN 4 Ave, Kigali City',
                city: 'Kigali',
                country: 'Rwanda'
            },
            receiver: {
                name: 'Sarah Kenya',
                email: 'sarah@example.com',
                phone: '+254-700-333-444',
                address: 'Flat 12, Westlands Heights',
                city: 'Nairobi',
                country: 'Kenya'
            },
            parcels: [{
                    weight: 2.5,
                    dimensions: { length: 20, width: 15, height: 10 },
                    description: 'Office Supplies',
                    declaredValue: 150
                }],
            status: Shipment_1.ShipmentStatus.IN_TRANSIT,
            type: 'international',
            totalWeight: 2.5,
            shippingCost: 85.00,
            userId: customer._id
        });
        // Create Shipment Events
        await ShipmentEvent_1.default.create([
            {
                shipmentId: shipment._id,
                status: Shipment_1.ShipmentStatus.PICKED_UP,
                location: 'Kigali, Rwanda',
                description: 'Package picked up by local courier.',
                actor: admin._id,
                timestamp: new Date(Date.now() - 86400000 * 2) // 2 days ago
            },
            {
                shipmentId: shipment._id,
                status: Shipment_1.ShipmentStatus.AT_ORIGIN_HUB,
                location: 'Kigali Hub',
                description: 'Sorted and prepared for export.',
                actor: admin._id,
                timestamp: new Date(Date.now() - 86400000) // 1 day ago
            },
            {
                shipmentId: shipment._id,
                status: Shipment_1.ShipmentStatus.IN_TRANSIT,
                location: 'International Air Transit',
                description: 'In flight to destination country.',
                actor: admin._id,
                timestamp: new Date()
            }
        ]);
        console.log('Sample standard shipment created.');
        // Seed some warehouses
        const warehouses = await Warehouse_1.default.create([
            {
                name: 'Kigali Hub',
                code: 'KGL-01',
                location: { address: 'Kigali City', city: 'Kigali', country: 'Rwanda' },
                zones: [{ name: 'General Storage', code: 'A', type: 'storage' }],
                isActive: true
            },
            {
                name: 'Nairobi Depot',
                code: 'NBO-01',
                location: { address: 'Mombasa Rd', city: 'Nairobi', country: 'Kenya' },
                zones: [{ name: 'General Storage', code: 'A', type: 'storage' }],
                isActive: true
            }
        ]);
        console.log('Warehouses seeded.');
        console.log('Seed data successfully fully populated!');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};
seedData();
