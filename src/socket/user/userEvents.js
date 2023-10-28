import * as userSocketService from "./../../services/socket/userSocketService.js";

export const setOnlineStatus = async (socket, io, status) => {
    await userSocketService.setOnlineStatus(socket, io, status);
}

export default (socket, io) => {

    socket.on('sendUserChat', async (data) => {
        await userSocketService.sendUserChat(socket, io, data);
    });

    socket.on('loadOldChat', async (data) => {
        await userSocketService.loadOldChat(socket, io, data);
    });

    socket.on('deleteUserChat', async (data) => {
        await userSocketService.deleteUserChat(socket, io, data);
    });
    
};