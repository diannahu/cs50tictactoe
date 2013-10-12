function Location(row, col) {
    this.row = row;
    this.col = col;
}

Location.prototype.isEqual = isEqual;

/*
 * Returns true if loc is equal to this location, false otherwise.
 */
function isEqual(loc) {
    return this.row === loc.row && this.col === loc.col;
}