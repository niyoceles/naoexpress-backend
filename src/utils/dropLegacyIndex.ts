import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/relayxpress';

async function dropLegacyIndex() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        
        const collection = mongoose.connection.collection('inventoryitems');
        
        console.log('Fetching active indices...');
        const indexes = await collection.getIndexes();
        console.log('Current Indexes:', JSON.stringify(indexes, null, 2));

        const legacyIndexName = 'skuId_1_warehouseId_1_zoneCode_1_binLocation_1';
        
        if (indexes[legacyIndexName]) {
            console.log(`Found legacy index: ${legacyIndexName}. Dropping...`);
            await collection.dropIndex(legacyIndexName);
            console.log('Index dropped successfully!');
        } else {
            console.log(`Index ${legacyIndexName} not found in the collection.`);
        }

        // Also check for any other compound unique indices that might cause trouble with nulls
        for (const [name, key] of Object.entries(indexes)) {
            if (name !== '_id_' && name !== 'sku_1') {
                 console.log(`Review index: ${name}`, key);
            }
        }

    } catch (err) {
        console.error('Error during cleanup:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

dropLegacyIndex();
