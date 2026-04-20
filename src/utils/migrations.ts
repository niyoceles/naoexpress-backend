import Complaint from '../models/Complaint';
import Shipment from '../models/Shipment';
import Migration from '../models/Migration';

const MIGRATIONS = [
    {
        name: 'backfill_complaint_tracking_number',
        version: 1,
        run: async () => {
            const complaintsToUpdate = await Complaint.find({
                trackingNumber: { $exists: false },
                shipmentId: { $ne: null }
            });

            if (complaintsToUpdate.length > 0) {
                console.log(`Found ${complaintsToUpdate.length} complaints missing trackingNumber. Backfilling...`);
                let updatedCount = 0;
                for (const complaint of complaintsToUpdate) {
                    const shipment = await Shipment.findById(complaint.shipmentId);
                    if (shipment && shipment.trackingNumber) {
                        complaint.trackingNumber = shipment.trackingNumber;
                        await complaint.save();
                        updatedCount++;
                    }
                }
                console.log(`Successfully backfilled trackingNumber for ${updatedCount} complaints.`);
            }
        }
    }
];

export const runMigrations = async () => {
    if (process.env.SKIP_MIGRATIONS === 'true') {
        console.log('--- 🛡️ Migrations skipped via environment variable ---');
        return;
    }

    try {
        console.log('--- 🛡️ Checking Startup Migrations ---');
        
        for (const mig of MIGRATIONS) {
            const existing = await Migration.findOne({ name: mig.name });
            
            if (!existing) {
                console.log(`Executing migration: ${mig.name} (v${mig.version})...`);
                await mig.run();
                await Migration.create({
                    name: mig.name,
                    version: mig.version,
                    executedAt: new Date()
                });
                console.log(`Migration ${mig.name} completed and recorded.`);
            }
        }

        console.log('--- ✅ All Migrations Up to Date ---');
    } catch (error) {
        console.error('Migration Error:', error);
    }
};
