import {
  game,
  gameStatus,
  placeSymbol,
  switchPlayer,
  presentCurrentBoard,
  flushVars,
} from './game.js';

/**
 * Creates and returns socket event handlers.
 * @param {object} io - The Socket.IO server instance.
 * @return {object} - An object containing the socket event handler functions.
 */
export default function createSocketEventHandlers(io) {
  /**
   * Handles a new connection event.
   * @param {object} socket - The connected socket instance.
   */
  const onConnect = (socket) =>{
    game.players.push({
      id: socket.id
    });
    if (game.players.length == 2) {
      io.emit('Game started. You are the [first | second] player.', game.players[0].id);
      /**
        // Push different messages to both sockets
        const player1Socket = io.to(game.players[0].id);
        const player2Socket = io.to(game.players[1].id);

        player1Socket.emit('Game started. You are the first player.');
        player2Socket.emit('Game started. You are the second player.');
        */
    }
  };
  /**
   * Helper function to check if the move is valid.
   * @param {object} socket - The connected socket instance.
   * @param {number} pos - The user's move on the game board.
   * @return {boolean} - Whether the move is valid or not.
   */
  const moveValid = (socket, pos) =>{
    if(!game.activePlayer) return true;
    if ((game.activePlayer.id != socket.id) ||
      !(pos > 0 && pos < 10) ||
      game.endGame ||
      game.currentBoard[pos - 1] === 'x' ||
      game.currentBoard[pos - 1] === 'o') {

      return false;
    }
    return true;
  };

  /**
   * Handles the user's play (move) event.
   * @param {number} move - The user's move on the game board.
   * @param {object} socket - The connected socket instance.
   */
  const playHandler = (socket, move) =>{
    if(game.players.length == 0) return;
    if (!game.activePlayer) game.activePlayer = game.players[0];
    const pos = parseInt(move, 10);

    if (!moveValid(socket, pos)) {
      socket.emit('InvalidMove');
      io.emit('currentBoard', presentCurrentBoard(), game.activePlayer.id);
      return;
    }

    game.currentBoard[pos-1] = placeSymbol();
    gameStatus(); // Check the game status

    if (!game.endGame) { // Game is not over, send Both clients board
      const currBoard = presentCurrentBoard();
      switchPlayer();
      io.emit('currentBoard', currBoard, game.activePlayer.id);
    } else { // Game is over, send event gameOver with winner and reason
      if (!game.winner) {
        io.emit('gameOver', game.winner, 'TIE');
        io.emit('playerDisconnect');
      }
      else {
        io.emit('gameOver', game.winner.id, 'FAIR');
        io.emit('playerDisconnect');
      }
      flushVars();
    }
  };

  /**
   * Handles user Resignation.
   */
  const resignHandler = (socket) =>{
    // If player1 resigns, Winner is player 2 and vice versa
    if(!game.players[1]){// meaning player 1 resigned before player 2 joined
      io.emit('gameOver', null, 'EARLY_OUT');
      socket.emit('playerDisconnect');
      flushVars();
      return;
    }
    if (socket.id === game.players[0].id) {
      io.emit('gameOver', game.players[1].id, 'RESIGN');
      io.emit('playerDisconnect');
    } else {
      io.emit('gameOver', game.players[0].id, 'RESIGN');
      io.emit('playerDisconnect');
    }

    flushVars();
  };

  /**
   * Handles user disconnection.
   */
  const disconnectHandler = (socket) =>{
    // If someone disconnects after the game has ended, Just flush and return
    // If another player disconnects , vars would be already flushed. just return
    if(game.players.length == 0) return;
    if (game.endGame) {
      flushVars();
      return;
    }
    try{
      if(!game.players[1]){// meaning player 1 resigned before player 2 joined
        io.emit('gameOver', null, 'EARLY_OUT');
        io.emit('playerDisconnect');
        flushVars();
        return;
      }
    }catch(e){
      console.log(e)
    }
    // If player1 resigns, Winner is player 2 and vice versa
    try{
    if (socket.id === game.players[0].id) {
      if(game.players[1]) {
        io.emit('gameOver', game.players[1].id, 'DISCONNECT');
        io.emit('playerDisconnect');
      }
    } else if(game.players[0]){
      io.emit('gameOver', game.players[0].id, 'DISCONNECT');
      io.emit('playerDisconnect');
    }
    flushVars();
  } catch(e){
    console.log(e)
  }
  };

  return {
    onConnect,
    resignHandler,
    playHandler,
    disconnectHandler,
  };
}

