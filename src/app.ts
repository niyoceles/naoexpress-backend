import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import shipmentRoutes from './routes/shipmentRoutes';
import trackingRoutes from './routes/trackingRoutes';
import warehouseRoutes from './routes/warehouseRoutes';
import adminRoutes from './routes/adminRoutes';
import customerRoutes from './routes/customerRoutes';
import courierRoutes from './routes/courierRoutes';
import warehouseOpsRoutes from './routes/warehouseOpsRoutes';
import supportRoutes from './routes/supportRoutes';
import complaintRoutes from './routes/complaintRoutes';

dotenv.config();

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', message: 'NAO Express Backend is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/track', trackingRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/courier', courierRoutes);
app.use('/api/warehouse-ops', warehouseOpsRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/complaints', complaintRoutes);

// Centralized Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
});

export default app;
