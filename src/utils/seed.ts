import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User, { UserRole } from '../models/User';
import Organization from '../models/Organization';
import Shipment, { ShipmentStatus } from '../models/Shipment';
import ShipmentEvent from '../models/ShipmentEvent';
import Warehouse from '../models/Warehouse';
import Complaint from '../models/Complaint';
import Contact from '../models/Contact';

dotenv.config();

export const seedDatabase = async (isForce = false) => {
    try {
        // If not forced, check if users already exist
        if (!isForce) {
            const userCount = await User.countDocuments();
            if (userCount > 0) {
                console.log('Database already has data. Skipping automatic seed.');
                return;
            }
        }

        console.log('Starting database seeding...');

        // Clear existing data only if forced or if DB was already empty (safety)
        await User.deleteMany({});
        await Organization.deleteMany({});
        await Shipment.deleteMany({});
        await ShipmentEvent.deleteMany({});
        await Warehouse.deleteMany({});
        await Contact.deleteMany({});

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
                name: 'Essential Office Supplies',
                weight: 2.5,
                dimensions: { length: 20, width: 15, height: 10 },
                description: 'Stationery, notebooks, and corporate branding materials.',
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

        // Seed some warehouses (Logistics Hubs)
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

        // Seed Complaints (Resolution Center)
        await Complaint.deleteMany({});
        
        const c1 = await Complaint.create({
            subject: 'Delayed Pickup in Kigali',
            description: 'My package was scheduled for pickup 3 hours ago and no one has arrived yet.',
            status: 'open',
            priority: 'urgent',
            userId: customer._id,
            trackingNumber: shipment.trackingNumber,
            shipmentId: shipment._id
        });

        const c2 = await Complaint.create({
            subject: 'Incorrect Weight Calculation',
            description: 'I believe my package was weighed incorrectly. The dashboard says 2.5kg but it should be 1.2kg.',
            status: 'in_progress',
            priority: 'medium',
            userId: customer._id,
            trackingNumber: shipment.trackingNumber,
            shipmentId: shipment._id,
            responses: [
                {
                    user: support._id,
                    message: "High John, we've received your request. We'll re-verify the weight at the Kigali Hub under the CCTV camera and update you soon.",
                    timestamp: new Date(Date.now() - 3600000)
                }
            ]
        });

        const c3 = await Complaint.create({
            subject: 'Delivery Successfully Redirected',
            description: 'I need to change my delivery address for Nairobi.',
            status: 'resolved',
            priority: 'low',
            userId: customer._id,
            trackingNumber: shipment.trackingNumber,
            shipmentId: shipment._id,
            responses: [
                {
                    user: support._id,
                    message: "Happy to help! Please provide the new coordinates.",
                    timestamp: new Date(Date.now() - 7200000)
                },
                {
                    user: customer._id,
                    message: "It is now Flat 5, Westlands Heights instead of Flat 12.",
                    timestamp: new Date(Date.now() - 7000000)
                },
                {
                    user: support._id,
                    message: "Update confirmed. The courier has been notified of the change to Flat 5.",
                    timestamp: new Date(Date.now() - 6500000)
                }
            ]
        });

        const c4 = await Complaint.create({
            subject: 'Guest Inquiry: Package not found',
            description: 'I sent a package yesterday but it does not show up in the tracking system yet. Please help!',
            status: 'open',
            priority: 'medium',
            guestEmail: 'guest_user@hotmail.com',
            guestPhone: '+254-711-222-333',
            trackingNumber: shipment.trackingNumber,
            shipmentId: shipment._id // Link to sample shipment anyway
        });

        console.log('Resolution Center complaints seeded.');

        // Seed Contact Us Inquiries
        await Contact.create([
            {
                email: 'hello@partner.com',
                phone: '+1-555-0199',
                subject: 'Partnership Opportunity',
                message: 'We are interested in integrating with your API for our e-commerce platform.',
                status: 'new'
            },
            {
                email: 'support_request@user.com',
                phone: '+250-700-111-222',
                subject: 'Lost Package Inquiry',
                message: 'I would like to know about the bulk shipping rates for regular routes from China to Rwanda.',
                status: 'read'
            },
            {
                email: 'john.smith@gmail.com',
                phone: '+44-20-7946-0958',
                subject: 'Career Inquiry',
                message: 'Are you currently hiring software engineers for your logistics optimization team?',
                status: 'replied'
            }
        ]);
        console.log('General Contact Us inquiries seeded.');

        // Update sample shipment with assignment
        await Shipment.findByIdAndUpdate(shipment._id, { assignedTo: warehouseOp._id });
        console.log('Sample shipment assigned to warehouse operator.');
        console.log('Seed data successfully populated!');
    } catch (error) {
        console.error('Error seeding data:', error);
    }
};

// Run if called directly
if (require.main === module) {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/naoexpress';
    mongoose.connect(mongoUri)
        .then(() => {
            console.log('Connected to MongoDB for seeding...');
            return seedDatabase(true); // Force seeding when run via CLI
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

