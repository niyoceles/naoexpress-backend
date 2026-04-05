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
exports.seedDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importStar(require("../models/User"));
const Organization_1 = __importDefault(require("../models/Organization"));
const Shipment_1 = __importStar(require("../models/Shipment"));
const ShipmentEvent_1 = __importDefault(require("../models/ShipmentEvent"));
const Warehouse_1 = __importDefault(require("../models/Warehouse"));
const InventoryItem_1 = __importDefault(require("../models/InventoryItem"));
dotenv_1.default.config();
const seedDatabase = async (isForce = false) => {
    try {
        // If not forced, check if users already exist
        if (!isForce) {
            const userCount = await User_1.default.countDocuments();
            if (userCount > 0) {
                console.log('Database already has data. Skipping automatic seed.');
                return;
            }
        }
        console.log('Starting database seeding...');
        // Clear existing data only if forced or if DB was already empty (safety)
        await User_1.default.deleteMany({});
        await Organization_1.default.deleteMany({});
        await Shipment_1.default.deleteMany({});
        await ShipmentEvent_1.default.deleteMany({});
        await Warehouse_1.default.deleteMany({});
        await InventoryItem_1.default.deleteMany({});
        console.log('Old data cleared.');
        // Create Admin Organization
        const org = await Organization_1.default.create({
            name: 'NAO Express Global',
            type: 'internal',
            contactEmail: 'hq@naoexpress.com',
            contactPhone: '+1-800-NAO-EXPR',
            address: '10 Logistics Way, Global Port, SG',
            settings: { autoPickup: true }
        });
        // Create Users
        const admin = await User_1.default.create({
            name: 'System Admin',
            email: 'admin@naoexpress.com',
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
            email: 'courier@naoexpress.com',
            password: 'password123',
            role: User_1.UserRole.COURIER
        });
        const warehouseOp = await User_1.default.create({
            name: 'Lagos Hub Manager',
            email: 'warehouse@naoexpress.com',
            password: 'password123',
            role: User_1.UserRole.WAREHOUSE_OP
        });
        const support = await User_1.default.create({
            name: 'Helpdesk Agent',
            email: 'support@naoexpress.com',
            password: 'password123',
            role: User_1.UserRole.SUPPORT
        });
        console.log('\n--- 🔑 Test Accounts Created ---');
        console.log('All passwords are: password123');
        console.log('Admin:       admin@naoexpress.com');
        console.log('Customer:    john@example.com');
        console.log('Courier:     courier@naoexpress.com');
        console.log('Warehouse:   warehouse@naoexpress.com');
        console.log('Support:     support@naoexpress.com');
        console.log('--------------------------------\n');
        // Create a Sample Shipment
        const shipment = await Shipment_1.default.create({
            trackingNumber: 'NAO-2024-521901',
            sender: {
                name: 'Kigali Central Office',
                email: 'logistics@naoexpress.rw',
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
            shippingCost: 0,
            userId: customer._id
        });
        // Create Shipment Events
        await ShipmentEvent_1.default.create([
            {
                shipmentId: shipment._id,
                status: Shipment_1.ShipmentStatus.PICKED_UP,
                location: 'Kigali, Rwanda',
                description: 'Professional pickup completed. No charges applied.',
                actor: admin._id,
                timestamp: new Date(Date.now() - 86400000 * 3) // 3 days ago
            },
            {
                shipmentId: shipment._id,
                status: Shipment_1.ShipmentStatus.AT_ORIGIN_HUB,
                location: 'Kigali Hub',
                description: 'Sorted at regional hub.',
                actor: admin._id,
                timestamp: new Date(Date.now() - 86400000 * 2) // 2 days ago
            },
            {
                shipmentId: shipment._id,
                status: Shipment_1.ShipmentStatus.DISPATCHED,
                location: 'Kigali Hub',
                description: 'Dispatched for international transit.',
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
        console.log('Sample free shipment created with DISPATCHED status.');
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
        // Seed Inventory
        await InventoryItem_1.default.create([
            {
                sku: 'EL-MBP-14',
                name: 'MacBook Pro 14 M3',
                description: 'Apple silicon high-performance laptop',
                quantity: 45,
                warehouseId: warehouses[0]._id,
                binLocation: 'KGL-A-12',
                status: 'in_stock'
            },
            {
                sku: 'EL-IPH-15',
                name: 'iPhone 15 Pro',
                description: 'Titanium grey 256GB',
                quantity: 8,
                warehouseId: warehouses[1]._id,
                binLocation: 'NBO-B-04',
                status: 'low_stock'
            }
        ]);
        console.log('Inventory items seeded.');
        // Update sample shipment with assignment
        await Shipment_1.default.findByIdAndUpdate(shipment._id, { assignedTo: warehouseOp._id });
        console.log('Sample shipment assigned to warehouse operator.');
        console.log('Seed data successfully populated!');
    }
    catch (error) {
        console.error('Error seeding data:', error);
    }
};
exports.seedDatabase = seedDatabase;
// Run if called directly
if (require.main === module) {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/naoexpress';
    mongoose_1.default.connect(mongoUri)
        .then(() => {
        console.log('Connected to MongoDB for seeding...');
        return (0, exports.seedDatabase)(true); // Force seeding when run via CLI
    })
        .then(() => {
        console.log('Seeding CLI finished.');
        process.exit(0);
    })
        .catch(err => {
        console.error('Seeding CLI error:', err);
        process.exit(1);
    });
}
