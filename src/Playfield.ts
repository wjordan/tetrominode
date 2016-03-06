import {PointInt} from "./PointInt";
import {Randomizer, BagRandomizer} from "./Randomizer";
import {Block} from "./Block";
import BlessedBox = Blessed.BlessedBox;
import {Polyomino} from "./Polyomino";
import {Cell} from "./Cell";
import {Piece} from "./Piece";
import {Set, Map, Iterable} from 'immutable';

/**
 * A two-dimensional grid where the action takes place.
 */
export class Playfield {
  spawnPos:PointInt = new PointInt(3, 3);
  playfieldSize:PointInt = new PointInt(10, 24);
  bag:Randomizer = new BagRandomizer(0);

  // Currently active Piece on the playfield.
  public piece: Piece;
  // Map of Cell spaces potentially occupied by Blocks.
  public grid: Map<PointInt, Cell>;
  constructor(getCanvas) {
    this.grid = Map<PointInt, Cell>(this.playfieldSize.range().map(point => [point, new Cell()]));

    // Create the view.
    this.canvas = getCanvas(this.grid);
    this.addPiece();
  }

  public get blocks(): Map<PointInt, Block> {
    return this.grid.map((cell, position) => cell.block).toMap();
  }

  public addPiece() {
    this.piece = new Piece(this.bag.getNextShape(), this.canvas, this);
  }

  public canvas: Map<PointInt, BlessedBox>;

  transitionPiece(func) {
    this.up();
    func();
    this.down();
  }
  up() { this.piece.draw(false); }
  down() { this.piece.draw(true); }

  removePiece() {
    this.piece.blocks.map(block => block.cell).forEach(cell => cell.remove());
  }

  /**Inserts a Piece / Block into the playfield at its current position.
   * @return false if the Piece was unable to be placed. */
  putPiece(): boolean {
    this.up();
    this.removePiece();
    this.piece.updateBlocks();
    if (this.empty(this.piece, this.piece.points())) {
      this.piece.blocks.forEach(block => block.cell.block = block);
      this.down();
      return true;
    } else {
      return false;
    }
  }

  empty(piece: Piece, points: Iterable<number|PointInt, PointInt>): boolean {
    return points.every(point => piece.points().contains(point) || this.grid.get(point, Cell.INVALID).isEmpty);
  }

  rotate() {
    this.transitionPiece(_ => this._rotate());
  }

  /**Rotates the current Piece.
   * @return True if the piece was rotated. */
  _rotate(): boolean {
    var newPoly:Polyomino = this.piece.shape.rotateRight();
    var newPiecePos = this.canRotate(this.piece, newPoly.points.map(point => point.add(this.piece.position)));
    if (newPiecePos != PointInt.ZERO) {
      this.piece.position = this.piece.position.add(newPiecePos);
      this.piece.shape = newPoly;
      this.putPiece();
      return true;
    } else {
      return false;
    }
  }

  canRotate(piece: Piece, points: Iterable<number|PointInt, PointInt>): PointInt {
    return Set.of(0, 1, -1)
      .map(x => new PointInt(x, 0)).find(point =>
        this.empty(piece, points.map(p => p.add(point))), null, PointInt.ZERO);
  }

  move(x: number, y: number) {
    this._move(new PointInt(x, y));
  }

  /**Attempts to move the active Piece up to the specified offset.
   * @return true if the Piece moved any amount. */
  _move(offset: PointInt): boolean {
    var newPos = this.movePos(offset);
    // console.log(`newpos=${newPos}`);
    if (newPos.equals(PointInt.ZERO)) {
      return false;
    }
    else {
      this.piece.position = this.piece.position.add(newPos);
      this.putPiece();
      return true;
    }
  }

  /**Checks possible movement of the active Piece.
   *  Works for horizontal and vertical movements of any amount.
   * @return the last valid Pos of the Piece before it can't move any further. */
  movePos(offset: PointInt): PointInt {
    const incr = offset.applyBoth(z => Math.max(-1, Math.min(1, z)));
    return this._movePos(
      PointInt.ZERO,
      offset,
      incr
    );
  }

  /**Recursive function to move the active Piece by increments until it can't be placed. */
  _movePos(currentOffset: PointInt, targetOffset: PointInt, incr: PointInt): PointInt {
    // console.log(`movePod: ${currentOffset}, ${targetOffset}, ${incr}`);
    const zero = targetOffset.equals(PointInt.ZERO);
    if (!zero && this.empty(this.piece, this.piece.points().map(point => point.add(currentOffset).add(incr)))) {
      return this._movePos(currentOffset.add(incr), targetOffset.subtract(incr), incr)
    }
    else return currentOffset;
  }
}
