import {PointInt} from "./PointInt";
import {Cell} from "./Cell";
import {Playfield} from "./Playfield";
/**
 * A single state-containing unit that can occupy a cell.
 */
export class Block {
  public static EMPTY: Block = new Block(PointInt.ZERO, '. ', null);
  public playfield: Playfield;
  public type: String;
  public position:PointInt;
  constructor(position, type, playfield) {
    this.playfield = playfield;
    this.type = type;
    this.position = position;
  }
  public get cell():Cell {
    if(this == Block.EMPTY) return Cell.INVALID;
    return this.playfield.grid.get(this.position, Cell.INVALID);
  }
}
