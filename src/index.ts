import app from './app';
import connectDB from './config/db';
import { seedDatabase } from './utils/seed';
import { runMigrations } from './utils/migrations';

const PORT = process.env.PORT || 5001;

// Connect to Database
connectDB().then(async () => {
    // Persistent Setup
    await runMigrations();     // Handles schema data updates (locked & safe)
    
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
});


