// global variable of game board
var board;

function newGame(difficulty) {
    // new internal board
    board = new Board(difficulty);

    // clear board display
    for (var r = 0; r < board.size; r++) {
        for (var c = 0; c < board.size; c++) {
            renderMove(new Move(new Location(r, c)), board.playersEnum.N);
        }
    }

    // update status for difficulty
    renderDifficulty(difficulty);
}

/*
 * Tries to make a move according to human input. Returns true if
 * successful, false otherwise.
 */
function humanPlay(square) {
    // if player clicks square when game is over
    if (board.gameOver) {
        alert("Game already over!");
        return false;
    }

    // if player clicks square when not his turn
    if (board.sideToMove === -1) {
        alert("Not your turn!");
        return false;
    }

    /*
     * move corresponding to square based on id location
     * e.g., parses id string "10" into ints 1, 0
     */
    var loc = new Location(parseInt(square.id.substring(0, 1), 10),
        parseInt(square.id.substring(1, 2), 10));
    var move = new Move(loc);

    // if desired move is not legal
    if (!board.isLegal(move)) {
        alert("Illegal move!");
        return false;
    }

    // play the move and render result
    board.doMove(move);
    renderMove(move, -board.sideToMove);

    // move successful!
    return true;
}

/*
 * Tries to make a move according to computer input
 */
function compPlay() {
    if (board.gameOver) {
        return;
    }
    // allow computer opponent to play its move and render result
    var eval = board.negamax(board.maxDepth);
    board.doMove(board.bestMove);
    renderMove(board.bestMove, -board.sideToMove);
}

/*
* Handles event that player clicks square to make a move
*/
function squareClicked(square) {
    // let human try to play
    if (humanPlay(square)) {
        // check whether move ends game
        if (board.isOver()) {
            renderOver();
        }
        // let computer play and check whether move ends game
        compPlay();
        if (board.isOver()) {
            renderOver();
        }
    }
}

/*
 * Render the board and status when the game ends
 */
function renderOver() {
    // set the status
    switch (board.winner) {
        case board.playersEnum.N:
            $("#status").html("Tie Game!");
            break;
        case board.playersEnum.X:
            $("#status").html("X Wins!");
            break;
        case board.playersEnum.O:
            $("#status").html("O Wins!");
            alert("AI YAI YAI!");
            break;
        default:
            alert("ERROR!");
    }

    // extract winning sequence info if applicable
    if (board.winner) {
        var type = board.winSeq.charAt(0);
        var ind = parseInt(board.winSeq.charAt(1), 10);
        renderOverBoard(type, ind);
    }
}

/*
 * Renders winning sequence in won board
 */
function renderOverBoard(type, ind) {
    // determine whether X or O won
    var winsrc = (board.winner === board.playersEnum.X) ? "xwin.png" : "owin.png";

    // highlight win (winning row, column, diagonal)
    switch (type) {
        case "r":
            for (var i = 0; i < board.size; i++) {
                $("#" + ind + i).attr("src", winsrc);
            }
            break;
        case "c":
            for (var i = 0; i < board.size; i++) {
                $("#" + i + ind).attr("src", winsrc);
            }
            break;
        case "d":
            for (var i = 0; i < board.size; i++) {
                var diaInd = (ind === 0) ? i : board.size - i - 1;
                $("#" + diaInd + i).attr("src", winsrc);
            }
            break;
        default:
            alert("ERROR!");
    }
}

/*
 * Renders difficulty status depending on player's selected difficulty
 */
function renderDifficulty(diff) {
    // string for qualitative level given numerical level of difficulty
    var level;

    // set level according to numerical difficulty
    switch (diff) {
        case 1:
            level = "n Easy ";
            break;
        case 4:
            level = " Medium ";
            break;
        case 9:
            level = " Hard ";
            break;
        default:
            alert("ERROR!");
    }
    // change status accordingly
    $("#status").html("A" + level + "Game");
}

/*
* Renders a move on the board for the side that just moved
*/
function renderMove(move, sideJustMoved) {
    // extract row and column of move
    var row = move.loc.row;
    var col = move.loc.col;

    // source of image file to show
    var imgsrc;

    // set image file source according to player that moved
    switch (sideJustMoved) {
        case board.playersEnum.N:
            imgsrc = "blank.png";
            break;
        case board.playersEnum.X:
            imgsrc = "x.png";
            break;
        case board.playersEnum.O:
            imgsrc = "o.png";
            break;
        default:
            alert("ERROR!");
    }

    // show image frpm source file accordingly
    $("#" + row + col).attr("src", imgsrc);
}