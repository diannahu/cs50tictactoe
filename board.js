function Board(difficulty) {
    // size of board
    this.size = 3;
    
    // make 2d array of squares, all initialized to zero
    this.squares = [];
    for (var i = 0; i < this.size; i++) {
        this.squares[i] = [];
        for (var j = 0; j < this.size; j++) {
            this.squares[i][j] = 0;
        }
    }

    // enum for players in game (N is "Neither")
    this.playersEnum = { O: -1, N: 0, X: 1 };

    // toggle between 1 and -1 for each player, respectively
    this.sideToMove = this.playersEnum.X;

    // winner of game (could eventually be 1 or -1)
    this.winner = null;

    // bool whether game is over
    this.gameOver = false;

    /*
     * if applicable, string to denote winning sequence
     * first char is type of win (r: row, c: column, d: diagonal)
     * second char is index i of win (row/col/dia i, and "\" is diagonal 0 win)
     */
    this.winSeq = null;

    // best move on the board
    this.bestMove = null;

    // max number of moves to analyze ahead (difficulty)
    this.maxDepth = difficulty;
}

Board.prototype.isWon = isWon;
Board.prototype.isDrawn = isDrawn;
Board.prototype.getMoves = getMoves;
Board.prototype.noMoves = noMoves;
Board.prototype.doMove = doMove;
Board.prototype.undoMove = undoMove;
Board.prototype.evaluation = evaluation;
Board.prototype.negamax = negamax;
Board.prototype.isLegal = isLegal;
Board.prototype.isOver = isOver;

/*
 * Returns true if game is won for other side, false if no winner
 */
function isWon() {
    return this.evaluation();
}

/*
 * Returns true if game is drawn, false otherwise
 */
function isDrawn() {
    // get all possible moves
    var moves = this.getMoves();

    // drawn if there is no win and no moves left to play
    if (!this.isWon() && moves.length === 0) {
        return true;
    }

    // not a draw
    return false;
}

/*
 * Sets the board's winner and gameOver fields appropriately.
 * Returns true if game is over, false otherwise.
 */
function isOver() {
    // number representing whether there was a win
    var winnerHere = this.isWon();

    // if there is a winner here or a draw, the game is over
    if (winnerHere || this.isDrawn()) {
        this.gameOver = true;

        /*
         * if there is a winner here, it is the opposite of the side to move
         * otherwise, there is no winner (winner is 0)
         */
        this.winner = winnerHere * this.sideToMove;
    }

    // gameOver is only set to true if game is over, otherwise stays false
    return this.gameOver;
}

/*
* Returns array of moves for side to move
*/
function getMoves() {
    // array to store possible moves
    var ret = [];

    // loop through all squares in board
    for (var i = 0; i < this.size; i++) {
        for (var j = 0; j < this.size; j++) {
            // store empty square as possible move
            if (this.squares[i][j] === 0) {
                var move = new Move(new Location(i, j));
                ret.push(move);
            }
        }
    }

    // return completed array
    return ret;
}

/*
 * Returns a value in case of a draw (here, 0)
 */
function noMoves() {
    return 0;
}

/*
 * Returns true if move is legal, false otherwise
 */
function isLegal(move) {
    // array of all legal moves
    var moves = this.getMoves();

    // return if move is found in array (with non-negative index)
    for (var i = 0, n = moves.length; i < n; i++) {
        if (moves[i].isEqual(move)) {
            return true;
        }
    }

    // move not found in legal moves
    return false;
}

/*
 * Performs a move on the board for side to move and updates side to move
 */
function doMove(move) {
    this.squares[move.loc.row][move.loc.col] = this.sideToMove;
    this.sideToMove *= -1;
}

/*
 * Undoes a move on the board for side to move and reverts side to move
 */
function undoMove(move) {
    this.squares[move.loc.row][move.loc.col] = 0;
    this.sideToMove *= -1;
}

/*
 * Returns an evaluation of a 3 x 3 tic-tac-toe board
 * 1 if player 1 (X) wins, -1 if player -1 (O) wins, 0 if neither wins
 */
function evaluation() {
    // marker against which to make comparisons across row/column/diagonal
    var marker;

    // loop through squares
    for (var i = 0; i < this.size; i++) {
        // check row
        marker = this.squares[i][0];
        if (marker !== 0 &&
            marker === this.squares[i][1] &&
            marker === this.squares[i][2]) {
            this.winSeq = "r" + i;
            return marker * this.sideToMove;
        }

        // check column
        marker = this.squares[0][i];
        if (marker !== 0 &&
            marker === this.squares[1][i] &&
            marker === this.squares[2][i]) {
            this.winSeq = "c" + i;
            return marker * this.sideToMove;
        }
    }

    // check diagonals
    marker = this.squares[1][1];
    if (marker === this.squares[0][0] && marker === this.squares[2][2]
        || marker === this.squares[2][0] && marker === this.squares[0][2]) {
        this.winSeq = (marker === this.squares[0][0]) ? "d" + 0 : "d" + 1;
        return marker * this.sideToMove;
    }

    // no win by either side
    this.winSeq = null;
    return 0;
}

/*
 * Calculates the best move for a board via negamax, a variant of minimax. Sets
 * the global variable bestMove accordingly and returns the corresponding score.
 * Inspired by Lexi Ross and her awesome cs51 checkers pset (:D) as well as by
 * Martin Fierz, http://www.fierz.ch/strategy1.htm
 */
function negamax(depth) {
    // pseudo-infinity (only three scores- 1: X win, -1: O win, 0: no win)
    var inf = 1;

    // if game is won (other side must have won), player loses with lowest score
    if (this.isWon()) {
        return -inf;
    }

    // base case, deepest level of reached, so return evaluation
    if (depth === 0) {
        return this.evaluation();
    }

    // array of moves that can be made
    var moves = this.getMoves();

    // if no possible moves left
    if (moves.length === 0) {
        return this.noMoves();
    }

    // default best value
    var bestValue = -inf;

    // loop through all possible moves and all search game tree recursively
    for (var i = 0, n = moves.length; i < n; i++) {
        // do move, check how its branch will evaluate, and undo move
        this.doMove(moves[i]);
        var value = -this.negamax(depth - 1);
        this.undoMove(moves[i]);

        // found newest best move
        if (value >= bestValue) {
            bestValue = value;

            // if at root of tree, store move as best move to make
            if (depth === this.maxDepth) {
                this.bestMove = moves[i];
            }
        }
    }

    // return score of bestMove
    return bestValue;
}