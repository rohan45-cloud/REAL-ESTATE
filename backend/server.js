import 'dotenv/config';
import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './sockets/index.js';

const PORT = process.env.PORT || 5000;

const start = async() => {
    await connectDB();

    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
        console.log(`🚀 PropNest API running on http://localhost:${PORT}`);
    });

    process.on('unhandledRejection', (err) => {
        console.error('Unhandled rejection:', err);
        server.close(() => process.exit(1));
    });
};

start();