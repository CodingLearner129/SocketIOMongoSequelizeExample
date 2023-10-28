import * as groupSocketService from "./../../services/socket/groupSocketService.js";

export default (socket, io) => {
    socket.on('loadOldGroupChat', async (data) => {
        socket.join(`#room@${data.group}`);
        await groupSocketService.loadOldGroupChat(socket, io, data);
    });

    socket.on('sendGroupChat', async (data) => {
        await groupSocketService.sendGroupChat(socket, io, data);
    });

    socket.on('deleteGroupChat', async (data) => {
        await groupSocketService.deleteGroupChat(socket, io, data);
    });
    
};