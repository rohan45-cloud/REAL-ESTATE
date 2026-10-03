import { Router } from 'express';
import mongoose from 'mongoose';
import authRoutes from './authRoutes.js';

const router = Router();

router.get('/health', (_req, res) => {
    const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.json({
        success: true,
        service: 'PropNest API',
        status: 'ok',
        database: dbStates[mongoose.connection.readyState] || 'unknown',
        uptime: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
    });
});

router.use('/auth', authRoutes);

export default router;