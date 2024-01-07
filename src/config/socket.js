import { Server } from 'socket.io';

let io;

export default {
    init: (httpServer) => {
        io = new Server(httpServer, {
            cors: {
              origin: ["https://admin.socket.io"],
              credentials: true
            }
          })
        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error("Socket.io not initialized!");
        }
        return io;
    },
};