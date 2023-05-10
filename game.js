const game = {
  board: `
  | 1 | 2 | 3 |
  | 4 | 5 | 6 |
  | 7 | 8 | 9 |
  `,
  currentBoard: Array(9).fill('.'),
  players: [],
  activePlayer: null,
  winner: null,
  endGame: false,
};


const checkGame = () => {
  const finish = game.currentBoard.filter((x) => x === 'x' || x === 'o');
  if (finish.length === 9) {
    game.endGame = true;
  }
};

const checkValue = (x, y, z) => {
  if (x === 'x' && y === 'x' && z === 'x') {
    return true;
  }
  if (x === 'o' && y === 'o' && z === 'o') {
    return true;
  }
};

const gameStatus = () => {
  checkGame();
  if (checkValue(game.currentBoard[0], game.currentBoard[4], game.currentBoard[8])) {
    game.endGame = true;
    game.winner = game.activePlayer;
  } else if (checkValue(game.currentBoard[0], game.currentBoard[3], game.currentBoard[6])) {
    game.endGame = true;
    game.winner = game.activePlayer;
  } else if (checkValue(game.currentBoard[0], game.currentBoard[1], game.currentBoard[2])) {
    game.endGame = true;
    game.winner = game.activePlayer;
  } else if (checkValue(game.currentBoard[1], game.currentBoard[4], game.currentBoard[7])) {
    game.endGame = true;
    game.winner = game.activePlayer;
  } else if (checkValue(game.currentBoard[2], game.currentBoard[4], game.currentBoard[6])) {
    game.endGame = true;
    game.winner = game.activePlayer;
  } else if (checkValue(game.currentBoard[2], game.currentBoard[5], game.currentBoard[8])) {
    game.endGame = true;
    game.winner = game.activePlayer;
  } else if (checkValue(game.currentBoard[3], game.currentBoard[4], game.currentBoard[5])) {
    game.endGame = true;
    game.winner = game.activePlayer;
  } else if (checkValue(game.currentBoard[6], game.currentBoard[7], game.currentBoard[8])) {
    game.endGame = true;
    game.winner = game.activePlayer;
  }
};

const placeSymbol = () => game.activePlayer == game.players[0] ? 'x' : 'o';

const switchPlayer = () => game.activePlayer == game.players[0] ?
                            game.activePlayer = game.players[1] :
                            game.activePlayer = game.players[0];


const presentCurrentBoard = () => `
   ${game.currentBoard[0]}  ${game.currentBoard[1]}  ${game.currentBoard[2]} 
   ${game.currentBoard[3]}  ${game.currentBoard[4]}  ${game.currentBoard[5]} 
   ${game.currentBoard[6]}  ${game.currentBoard[7]}  ${game.currentBoard[8]} 
`;

const flushVars = () => {
  game.currentBoard = Array(9).fill('.');
  game.players = [];
  game.activePlayer = null;
  game.winner = null;
  game.endGame = false;
};

export {
  game,
  checkGame,
  checkValue,
  gameStatus,
  placeSymbol,
  switchPlayer,
  flushVars,
  presentCurrentBoard,
};
