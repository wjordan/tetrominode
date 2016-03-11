import {PointInt} from "./PointInt";
import {Cell} from "./Cell";
import {Playfield} from "./Playfield";
/**
 * A single state-containing unit that can occupy a cell.
 */
export class Block {
  public static EMPTY:Block = new Block();
  constructor(
    public position:PointInt = PointInt.ZERO,
    public pieceType:number = -1,
    public cellType:number = -1,
    public playfield?:Playfield) {
  }
  public get cell():Cell {
    if (this === Block.EMPTY) {
      return Cell.INVALID;
    }
    return this.playfield.grid.get(this.position, Cell.INVALID);
  }
}
