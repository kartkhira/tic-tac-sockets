import { io } from 'socket.io-client';
import readCommand from 'readcommand';

const link = process.argv[2];
const port = process.argv[3];
let pos; // first or second position indicator
let altPos;
let ID;
let socket;

/**
 * Validate link and port, then create a Socket.IO connection
 */
if (!link || !port) {
  console.log('Please Enter the weblink and port');
} else {
  const address = `http://${link}:${port}`;
  socket = io(address); // concatenate link and port to make the socket
}

/**
 * Establish a connection with the server
 */
socket.on('connect', async () => {
  console.log(`connected to ${link} ${port}`);
  ID = socket.id;

  /**
   * Set up the game, determine if the current player is the first or second player
   */
  socket.on('Game started. You are the [first | second] player.', (id) => {
    if (id == ID) {
      pos = 'first';
      altPos = 'second';
      readCommand.read((err, args) => {
        socket.emit('play', args[0]);
      });
    } else {
      pos = 'second';
      altPos = 'first';
    }
    console.log(`You are ${pos} player`);
  });

  /**
   * Display the current board and request input if it's the current player's turn
   */
  socket.on('currentBoard', (currBoard, id) => {
    readCommand.read((err, args) => {
      if (err && err.code === 'SIGINT') {
        socket.disconnect();
        process.exit();
      }
      else if (args[0]== 'r'){
        handleResign();
      }
      else {
        if(id == ID){
          socket.emit('play', args[0]);
        }
      }
    });
  });

  /**
   * Handle the game over event and display the appropriate message
   * @param {string} id - The socket ID of the winning player
   * @param {string} reason - The reason the game ended ('TIE', 'FAIR', 'RESIGN', or 'DISCONNECT')
   */
  socket.on('gameOver', (id, reason) => {
    if (reason == 'TIE') {
      console.log('Game is tied.');
    }
    if (reason == 'FAIR') {
      if (ID == id) {
        console.log(`Game won by ${pos} player.`);
      } else console.log(`Game won by ${altPos} player.`);
    }
    if (reason == 'RESIGN') {
      if (ID == id) {
        console.log(`Game won by ${pos} player due to resignation.`);
      } else console.log(`Game won by ${altPos} player due to resignation.`);
    }
    if (reason == 'DISCONNECT') {
      if (ID == id) {
        console.log(`Game won by ${pos} player since ${altPos} player disconnected.`);
      } else console.log(`Game won by ${altPos} player since ${pos} player disconnected.`);
    }
  });

  socket.on('EARLY_OUT', ()=>{
    console.log('You resigned/disconnected before other player joined');
  })

  socket.on('InvalidMove', ()=>{
    console.log('Move was Invalid, Please try again');
  });

  socket.on('playerDisconnect', () => {
    console.log('You are disconnected from server!');
  });

  const handleResign = () => {
    socket.emit('r');
  };
  
});
