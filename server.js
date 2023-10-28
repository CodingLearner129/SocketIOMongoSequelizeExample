import app from './app.js';
import http from 'http';
import { Server } from 'socket.io';
import { config } from './src/config/config.js';
import { setTimeout } from 'timers/promises';
import os from 'os';

// get all the cores of cpu
// const cpuCores = os.cpus();
// console.log(cpuCores);

// // get number the cores of cpu
// const numberOfCPUCores = cpuCores.length;
// console.log(numberOfCPUCores); 

const server = http.createServer(app);

import socketConfiguration from "./src/config/socket.js";
import userEvents, { setOnlineStatus } from "./src/socket/user/userEvents.js";
import groupEvents from "./src/socket/group/groupEvents.js";

// const io = new Server(server);
// new style

const io = socketConfiguration.init(server);

let users = 0;
// io.engine.generateId = (req) => {
//     return "X4zy3lQSOVM-PsO9AAAB"; // must be unique across all Socket.IO servers
// }

io.on("connection", (socket) => {
    // console.log(socket);
    console.log(`socket connected to ${socket.id}`);

    users++;
    // event trigger for global connection to all users
    // io.sockets.emit('broadcast', {message: `${users} users connected`});

    // event trigger for newly connected current user
    socket.emit("newUserConnect", { message: `Hi, Welcome to socket-io-example` });

    // event trigger for all already connected users (newly connected current user not included)
    socket.broadcast.emit("newUserConnect", { message: `${users} users connected` });

    const sendMessage = setInterval(() => {
        console.log(123);
        socket.send(`"send" Sent message from server side by pre-reserved events`); // you get it on client side on message event
        // you can also trigger event like this; this is custom event trigger syntax 
        socket.emit('message', `"message" Sent message from server side by pre-reserved events`);
        socket.emit('myCustomEvent', { description: `"myCustomEvent" Sent message from server side by pre-reserved events` });
        clearInterval(sendMessage);
    }, 3000);
    socket.on("myCustomEventClientSide", (data) => {
        console.log(data);
    })
    // socket.send('Sent message from server side by pre-reserved events');
    // socket.emit('message', 'Sent message from server side by pre-reserved events');

    socket.on("disconnect", () => {
        console.log("socket disconnected");
        users--;
        // event trigger for all already connected users (newly connected current user not included)
        socket.broadcast.emit("newUserConnect", { message: `${users} users connected` });

        // event trigger for global connection to all users
        // io.sockets.emit('broadcast', {message: `${users} users connected`});
    });
});


const adminIO = io.of(`/admin`);

let room = 1;
let full = 0;
adminIO.on('connection', (socket) => {
    console.log(`admin socket connected to ${socket.id}`);
    // const sendMessage = setInterval(() => {

    //     socket.emit('myCustomEvent', {description: `"myCustomEvent" Sent message from admin server side by pre-reserved events`});

    //     clearInterval(sendMessage);
    // }, 3000);

    //join to room
    socket.join(`room-${room}`);

    socket.emit('connectedRoom', `You are connected to room no. ${room}`);

    full++;
    if (full >= 2) {
        full = 0;
        room++;
    }

    socket.on("disconnect", () => {
        console.log("admin socket disconnected");
    });
});

const uspIO = io.of('/user-namespace');
uspIO.on('connection', async (socket) => {
    console.log('---------------------------------');
    console.log('New user connected');
    console.log('---------------------------------');
    console.log({socketId: socket.id, user: socket.handshake.auth.token});
    console.log('---------------------------------');
    await setOnlineStatus(socket, uspIO, 1);
    userEvents(socket, uspIO);
    groupEvents(socket, uspIO);

    socket.on("disconnect", async () => {
        await setOnlineStatus(socket, uspIO, 0);
        console.log('---------------------------------');
        console.log("user socket disconnected");
        console.log('---------------------------------');
        console.log({socketId: socket.id, user: socket.handshake.auth.token});
        console.log('---------------------------------');
    });
});

// get env data from config file
const port = config.port;
const host = config.host;

const listenServer = server.listen(port, () => {
    console.log(`Listening on http://${host}:${port}`);
});
