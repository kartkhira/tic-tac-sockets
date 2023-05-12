class Game {
    constructor() {
      this.board = `
        | 1 | 2 | 3 |
        | 4 | 5 | 6 |
        | 7 | 8 | 9 |
      `;
      this.currentBoard = Array(9).fill('.');
      this.players = [];
      this.activePlayer = null;
      this.winner = null;
      this.endGame = false;
      this.winningConditions = [
        [0, 4, 8],
        [0, 3, 6],
        [0, 1, 2],
        [1, 4, 7],
        [2, 4, 6],
        [2, 5, 8],
        [3, 4, 5],
        [6, 7, 8],
      ];
    }
  
    checkGame() {
      const finish = this.currentBoard.filter((x) => x === 'x' || x === 'o');
      if (finish.length === 9) {
        this.endGame = true;
      }
    }
  
    checkValue(x, y, z) {
      return (x === 'x' && y === 'x' && z === 'x') || (x === 'o' && y === 'o' && z === 'o');
    }
  
    gameStatus() {
      this.checkGame();
      for (let condition of this.winningConditions) {
        if (this.checkValue(this.currentBoard[condition[0]], this.currentBoard[condition[1]], this.currentBoard[condition[2]])) {
          this.endGame = true;
          this.winner = this.activePlayer;
          break;
        }
      }
    }
  
    placeSymbol() {
      return this.activePlayer === this.players[0] ? 'x' : 'o';
    }
  
    switchPlayer() {
      this.activePlayer = this.activePlayer === this.players[0] ? this.players[1] : this.players[0];
    }
  
    presentCurrentBoard() {
      return `
         ${this.currentBoard[0]}  ${this.currentBoard[1]}  ${this.currentBoard[2]} 
         ${this.currentBoard[3]}  ${this.currentBoard[4]}  ${this.currentBoard[5]} 
         ${this.currentBoard[6]}  ${this.currentBoard[7]}  ${this.currentBoard[8]} 
      `;
    }
  
    flushVars() {
      this.currentBoard = Array(9).fill('.');
      this.players = [];
      this.activePlayer = null;
      this.winner = null;
      this.endGame = false;
    }
  }
  
  export {Game};
  