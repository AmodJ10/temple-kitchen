import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import { generalLimiter } from './middleware/rateLimiter.js';
import errorHandler from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.js';
import sevekariRoutes from './routes/sevekaris.js';
import inventoryRoutes from './routes/inventoryItems.js';
import vendorRoutes from './routes/vendors.js';
import eventRoutes from './routes/events.js';
import dishRoutes from './routes/dishes.js';
import procurementRoutes from './routes/procurements.js';
import attendanceRoutes from './routes/attendance.js';
import inventoryUsedRoutes from './routes/inventoryUsed.js';
import meetingRoutes from './routes/meetings.js';
import taskRoutes from './routes/tasks.js';
import dashboardRoutes from './routes/dashboard.js';
import userRoutes from './routes/users.js';

const app = express();

// ─── Security ────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(mongoSanitize());
// Rate limiter (disabled in dev via max:0, active in production)
app.use(generalLimiter);

// ─── Body Parsing ────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Health Check ────────────────────────────────────────────────
app.get('/api/v1/health', (_req, res) => {
    res.json({ success: true, message: 'MSM Kitchen API is running 🙏', timestamp: new Date().toISOString() });
});

// ─── API Routes ──────────────────────────────────────────────────
// Prevent browsers and CDN from caching API responses (avoids sticky sessions or returning wrong user on refresh)
app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    next();
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/sevekaris', sevekariRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/dishes', dishRoutes);
app.use('/api/v1/procurements', procurementRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/inventory-used', inventoryUsedRoutes);
app.use('/api/v1/meetings', meetingRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/users', userRoutes);

// ─── Production Static File Serving ──────────────────────────────
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
    const clientDist = path.join(__dirname, '../../client/dist');
    app.use(express.static(clientDist));

    // SPA fallback — serve index.html for all non-API routes
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ success: false, message: 'API route not found' });
        }
        res.sendFile(path.join(clientDist, 'index.html'));
    });
} else {
    // ─── 404 Handler (Dev only, Vite handles frontend) ───────────
    app.use((_req, res) => {
        res.status(404).json({ success: false, message: 'Route not found' });
    });
}

// ─── Global Error Handler ────────────────────────────────────────
app.use(errorHandler);

export default app;
