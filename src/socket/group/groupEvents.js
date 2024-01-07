import * as groupSocketService from "./../../services/socket/groupSocketService.js";

export default (socket, io) => {
    socket.on('joinRoom', async (data, cb) => {
        socket.join(`#room@${data.group}`);
        cb(`You have joined #room@${data.group} room successfully`);
    });
    socket.on('loadOldGroupChat', async (data) => {
        await groupSocketService.loadOldGroupChat(socket, io, data);
    });

    socket.on('sendGroupChat', async (data) => {
        await groupSocketService.sendGroupChat(socket, io, data);
    });

    socket.on('deleteGroupChat', async (data) => {
        await groupSocketService.deleteGroupChat(socket, io, data);
    });
    
};