import {Block} from "./Block";
import {PointInt} from "./PointInt";
import {Playfield} from "./Playfield";

export class Cell {
  static INVALID: Cell = new Cell();
  private _block:Block = Block.EMPTY;
  get block():Block {
    return this._block;
  }
  set block(b:Block) {
    this._block = b;
    this.draw();
  }
  get isInvalid() { return this === Cell.INVALID; }
  get isEmpty() { return !this.isInvalid && this.block === Block.EMPTY; }
  remove() {
    this.block = Block.EMPTY;
    this.getNeighbor(new PointInt(0, 1)).draw();
  }
  constructor(public position:PointInt = PointInt.ZERO, public playfield?:Playfield) {}

  getNeighbor(offset:PointInt = new PointInt(0, -1)):Cell {
    return this.playfield.grid.get(this.position.add(offset), Cell.INVALID);
  }

  shiftDown(): Block {
    if (this.isInvalid) {
      return Block.EMPTY;
    }
    const oldBlock = this.block;
    this.remove();
    this.block = this.getNeighbor().shiftDown();
    return oldBlock;
  }

  shiftUp(b:Block):void {
    const oldBlock = this.block;
    this.remove();
    this.block = b;
    this.getNeighbor().shiftUp(oldBlock);
  }

  draw():void {
    if (this.playfield) {
      this.playfield.view.drawCell(this.position);
    }
  }
}
