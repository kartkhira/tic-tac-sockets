import { io } from 'socket.io-client';
import readline from 'readline';

const link = process.argv[2];
const port = process.argv[3];
let socket;
let pos, altPos, ID, shouldHandleInput = false;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '' // Empty prompt string
});

/**
 * Set up socket connection using the link and port provided as command line arguments.
 */
function setupSocket() {
  if (!link || !port) {
    console.log('Please Enter the weblink and port');
    process.exit(1);
  } else {
    const address = `http://${link}:${port}`;
    socket = io(address); // concatenate link and port to make the socket
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      process.exit(1);
    });

    socket.on('connect_timeout', () => {
      console.error('Socket connection timeout');
      process.exit(1);
    });
  }
}

/**
 * Handle SIGINT event (Ctrl+C) to disconnect socket and exit the process.
 */
function handleSigint() {
  process.on('SIGINT', () => {
    socket.disconnect();
    process.exit(0);
  });
}


/**
 * Handle readline events for user input and SIGINT.
 */
function handleReadline() {
  rl.setMaxListeners(20);

  rl.on('line', (input) => {
    if (input == 'r') {
      handleResign();
    } else if (shouldHandleInput) {
      socket.emit('play', input);
    }
  });

  rl.on('SIGINT', () => {
    socket.disconnect();
    rl.close(); // Close readline interface
    process.exit(0);
  });
}

/**
 * Send resignation message to the server.
 */
function handleResign() {
  socket.emit('r');
}

/**
 * Read user input and determine if it should be handled.
 * @param {string} id - The socket ID of the current player
 */
function readInput(id) {
  shouldHandleInput = (id == ID);
}

/**
 * Handle socket events for connection, game start, current board, game over, invalid move, player disconnect, and server full.
 */
function handleSocketEvents() {
  socket.on('connect', async () => {
    console.log(`connected to ${link} ${port}`);
    ID = socket.id;
    socket.emit('join');
  });

  socket.on('gameStart', (msg,currBoard, id) => {
    readInput(id);
    pos = (id == ID) ? 'first' : 'second';
    altPos = (id == ID) ? 'second' : 'first';
  });

  socket.on('currentBoard', (currBoard, id) => {
    console.log(currBoard);
    readInput(id);
  });

  socket.on('gameOver', (id, reason) => {
    let winner = (ID == id) ? pos : altPos;
    switch(reason) {
      case 'TIE':
        console.log('Game is tied.');
        break;
      case 'FAIR':
        console.log(`Game won by ${winner} player.`);
        break;
      case 'RESIGN':
        console.log(`Game won by ${winner} player due to resignation.`);
        break;
      case 'DISCONNECT':
        console.log(`Game won by ${winner} player since ${altPos} player disconnected.`);
        break;
      case 'EARLY_OUT':
        console.log('You resigned/disconnected before other player joined');
        break;
    }
  });

  socket.on('InvalidMove', () => {
    //console.log('Move was Invalid, Please try again');
  });

  socket.on('playerDisconnect', () => {
    socket.disconnect();
    process.exit(0);
  });

  socket.on('serverFull', () => {
    socket.disconnect();
    process.exit(0);
  });
}

/**
 * Main function to set up socket, handle SIGINT, handle readline, and handle socket events.
 */
function main() {
  setupSocket();
  handleSigint();
  handleReadline();
  handleSocketEvents();
}

main();