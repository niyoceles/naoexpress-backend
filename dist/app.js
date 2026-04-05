"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const shipmentRoutes_1 = __importDefault(require("./routes/shipmentRoutes"));
const trackingRoutes_1 = __importDefault(require("./routes/trackingRoutes"));
const warehouseRoutes_1 = __importDefault(require("./routes/warehouseRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const customerRoutes_1 = __importDefault(require("./routes/customerRoutes"));
const courierRoutes_1 = __importDefault(require("./routes/courierRoutes"));
const warehouseOpsRoutes_1 = __importDefault(require("./routes/warehouseOpsRoutes"));
const supportRoutes_1 = __importDefault(require("./routes/supportRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'RelayXpress Backend is running' });
});
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/shipments', shipmentRoutes_1.default);
app.use('/api/track', trackingRoutes_1.default);
app.use('/api/warehouses', warehouseRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/customer', customerRoutes_1.default);
app.use('/api/courier', courierRoutes_1.default);
app.use('/api/warehouse-ops', warehouseOpsRoutes_1.default);
app.use('/api/support', supportRoutes_1.default);
// Centralized Error Handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
});
exports.default = app;
