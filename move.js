function Move(loc) {
    this.loc = new Location(loc.row, loc.col);
}

Move.prototype.isEqual = isEqual;

/*
* Returns true if move is equal to this move, false otherwise.
*/
function isEqual(move) {
    return this.loc.isEqual(move.loc);
}