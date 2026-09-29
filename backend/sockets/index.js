import { Server } from 'socket.io';

let io = null;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`🔌 Socket connected: ${socket.id}`);
        }
        socket.on('disconnect', () => {
            if (process.env.NODE_ENV === 'development') {
                console.log(`🔌 Socket disconnected: ${socket.id}`);
            }
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) throw new Error('Socket.IO has not been initialised');
    return io;
};