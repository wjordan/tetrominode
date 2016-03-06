import {Block} from "./Block";

export class Cell {
  public static INVALID: Cell = new Cell();
  public block: Block;
  constructor() {
    this.block = Block.EMPTY;
  }
  public get isEmpty() {
    if (this == Cell.INVALID) return false;
    return this.block == Block.EMPTY;
  }
  public remove() {
    this.block = Block.EMPTY;
  }
}
