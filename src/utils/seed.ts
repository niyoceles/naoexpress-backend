import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User, { UserRole } from '../models/User';
import Organization from '../models/Organization';
import Shipment, { ShipmentStatus } from '../models/Shipment';
import ShipmentEvent from '../models/ShipmentEvent';
import Warehouse from '../models/Warehouse';
import InventoryItem from '../models/InventoryItem';

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/naoexpress');
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Organization.deleteMany({});
        await Shipment.deleteMany({});
        await ShipmentEvent.deleteMany({});
        await Warehouse.deleteMany({});
        await InventoryItem.deleteMany({});

        console.log('Old data cleared.');

        // Create Admin Organization
        const org = await Organization.create({
            name: 'NAO Express Global',
            type: 'internal',
            contactEmail: 'hq@naoexpress.com',
            contactPhone: '+1-800-NAO-EXPR',
            address: '10 Logistics Way, Global Port, SG',
            settings: { autoPickup: true }
        });

        // Create Users
        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@naoexpress.com',
            password: 'password123',
            role: UserRole.ADMIN,
            orgId: org._id
        });

        const customer = await User.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            role: UserRole.CUSTOMER
        });

        const courier = await User.create({
            name: 'Speedy Rider',
            email: 'courier@naoexpress.com',
            password: 'password123',
            role: UserRole.COURIER
        });

        const warehouseOp = await User.create({
            name: 'Lagos Hub Manager',
            email: 'warehouse@naoexpress.com',
            password: 'password123',
            role: UserRole.WAREHOUSE_OP
        });

        const support = await User.create({
            name: 'Helpdesk Agent',
            email: 'support@naoexpress.com',
            password: 'password123',
            role: UserRole.SUPPORT
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
        const shipment = await Shipment.create({
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
            status: ShipmentStatus.IN_TRANSIT,
            type: 'international',
            totalWeight: 2.5,
            shippingCost: 0,
            userId: customer._id
        });

        // Create Shipment Events
        await ShipmentEvent.create([
            {
                shipmentId: shipment._id,
                status: ShipmentStatus.PICKED_UP,
                location: 'Kigali, Rwanda',
                description: 'Professional pickup completed. No charges applied.',
                actor: admin._id,
                timestamp: new Date(Date.now() - 86400000 * 3) // 3 days ago
            },
            {
                shipmentId: shipment._id,
                status: ShipmentStatus.AT_ORIGIN_HUB,
                location: 'Kigali Hub',
                description: 'Sorted at regional hub.',
                actor: admin._id,
                timestamp: new Date(Date.now() - 86400000 * 2) // 2 days ago
            },
            {
                shipmentId: shipment._id,
                status: ShipmentStatus.DISPATCHED,
                location: 'Kigali Hub',
                description: 'Dispatched for international transit.',
                actor: admin._id,
                timestamp: new Date(Date.now() - 86400000) // 1 day ago
            },
            {
                shipmentId: shipment._id,
                status: ShipmentStatus.IN_TRANSIT,
                location: 'International Air Transit',
                description: 'In flight to destination country.',
                actor: admin._id,
                timestamp: new Date()
            }
        ]);

        console.log('Sample free shipment created with DISPATCHED status.');

        // Seed some warehouses
        const warehouses = await Warehouse.create([
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
        await InventoryItem.create([
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
        await Shipment.findByIdAndUpdate(shipment._id, { assignedTo: warehouseOp._id });
        console.log('Sample shipment assigned to warehouse operator.');
        console.log('Seed data successfully fully populated!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
