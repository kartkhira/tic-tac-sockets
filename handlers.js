import { Game } from './game.js';
const game = new Game();

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

    if(io.engine.clientsCount > 2) {
      socket.emit('serverFull');
      return;
    }
    game.players.push({
      id: socket.id
    });
    if (game.players.length == 2) {

        // Push different messages to both sockets
        const player1Socket = io.to(game.players[0].id);
        const player2Socket = io.to(game.players[1].id);
        game.activePlayer = game.players[0];
        player1Socket.emit('gameStart','Game started. You are the first player.', game.presentCurrentBoard(),  game.players[0].id);
        player2Socket.emit('gameStart','Game started. You are the second player.', game.presentCurrentBoard(),  game.players[0].id);
        
    }
  };
  /**
   * Helper function to check if the move is valid.
   * @param {object} socket - The connected socket instance.
   * @param {number} pos - The user's move on the game board.
   * @return {boolean} - Whether the move is valid or not.
   */
  const moveValid = (socket, pos) =>{
    if(!game.activePlayer) return false;
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
    const pos = parseInt(move, 10);

    if (!moveValid(socket, pos)) {
      socket.emit('InvalidMove');
      socket.emit('currentBoard', game.presentCurrentBoard(), game.activePlayer.id);
      return;
    }

    game.currentBoard[pos-1] = game.placeSymbol();
    game.gameStatus(); 

    if (!game.endGame) { 
      const currBoard = game.presentCurrentBoard();
      game.switchPlayer();
      io.emit('currentBoard', currBoard, game.activePlayer.id);
    } else { 
      if (!game.winner) {
        gameOver(null, 'TIE');
      }
      else {
        gameOver(game.winner.id, 'FAIR');
      }
      game.flushVars();
    }
  };

  /**
   * Handles user Resignation.
   */
  const resignHandler = (socket) =>{

    // Player 1 resigns before player 2 joined
    if(!game.players[1]){
      gameOver(null, 'EARLY_OUT');
      game.flushVars();
      return;
    }
    if (socket.id === game.players[0].id) {
      gameOver(game.players[1].id, 'RESIGN');
    } else {
      gameOver(game.players[0].id, 'RESIGN');
    }

    game.flushVars();
  };

  /**
   * Handles user disconnection.
   */
  const disconnectHandler = (socket) =>{

    //Error Handling for erronerous setup of game.
    if (game.endGame) {
      game.flushVars();
      return;
    }
    // If player disconnects before other joined
    if(!game.players[0] || !game.players[1]){ 
      gameOver(null, 'EARLY_OUT');
      game.flushVars();
      return;
    }

    // if Player one Disconnected, player 2 is winner and viceversa
    if (socket.id === game.players[0].id) {
        gameOver(game.players[1].id, 'DISCONNECT');
    }else {
      gameOver(game.players[0].id, 'DISCONNECT');
    }
    game.flushVars();
    
  };

    /**
   * Handles the end of a game, emits the 'gameOver' event.
   * @param {string} id - The id of the winner.
   * @param {string} reason - The reason for ending the game.
   */
  const gameOver = (id, reason) =>{
    io.emit('gameOver', id, reason);
    io.emit('playerDisconnect');
  }

  return {
    onConnect,
    resignHandler,
    playHandler,
    disconnectHandler,
  };
}

