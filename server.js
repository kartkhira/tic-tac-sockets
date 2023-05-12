/**
 * Import required modules and create socket event handlers
 */
import {Server} from 'socket.io';
import {createServer} from 'http';
import createSocketEventHandlers from './handlers.js';


/**
 * Configure the Socket.IO server with CORS settings
 */
const httpServer = createServer();
const io = new Server(httpServer, {
  timeout: 30000, // timeout for receving pong packets in ms
  cors: {
    origin: '*', // Allow CORS from any origin
  },
});

/**
 * Destructure the event handlers from the created handlers
 */
const {
  onConnect,
  resignHandler,
  playHandler,
  disconnectHandler,
} = createSocketEventHandlers(io);

const PORT = process.argv[2]; // Use the third command line argument as the PORT or default to 5050

if (!PORT) {
  throw new Error('Please provide the PORT number as a command line argument');
}

/**
 * Start the server and listen on the specified port
 */
httpServer.listen(PORT, ()=>{
  console.log(`Server started on Port ${PORT}`);
});

/**
 * Define the 'onConnection' function to handle various events
 * @param {object} socket - The connected socket instance
 */
const onConnection = (socket) =>{
  onConnect(socket);
  socket.on('r', ()=>resignHandler(socket));
  socket.on('play', (move) => playHandler(socket, move));
  socket.on('disconnect', () => disconnectHandler(socket));
};
/**
 * Set up the 'connection' event for the Socket.IO server
 * Following standard application structure
 * https://socket.io/docs/v4/server-application-structure/
 */
io.on('connection', onConnection);
