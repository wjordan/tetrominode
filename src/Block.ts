import {PointInt} from "polyomino";
import {Cell} from "./Cell";
import {Playfield} from "./Playfield";

/**
 * A single state-containing unit that can occupy a cell.
 */
export class Block {
  public static ZERO: PointInt = new PointInt(0, 0);
  public static EMPTY: Block = new Block();
  constructor(
    public position: PointInt = Block.ZERO,
    public pieceType: number = -1,
    public cellType: number = -1,
    public playfield?: Playfield) {
  }
  public get cell(): Cell {
    if (this === Block.EMPTY) {
      return Cell.INVALID;
    }
    return this.playfield.grid.get(this.position, Cell.INVALID);
  }
}
