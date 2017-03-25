import {Block} from "./Block";
import {Cell} from "./Cell";
import {emptyPolyomino} from "./EmptyPolyomino";
import {Playfield} from "./Playfield";
import {Iterable, List} from "immutable";
import {PointInt, Polyomino} from "polyomino";

/**
 * A single polyomino piece in a fixed position/rotation.
 * Contains a set of Blocks.
 */
export class Piece {
  static EMPTY:Piece = new Piece();

  position: PointInt = Cell.ZERO;
  blocks: List<Block>;
  shape:Polyomino;

  constructor(
    shapeTuple: [number, Polyomino] = [0, emptyPolyomino],
    playfield?:Playfield
  ) {
    const [shapeIndex, shape] = shapeTuple;
    this.shape = shape;
    this.blocks = this.shape.points.toList().map((point, index) => new Block(point.add(this.position), shapeIndex, index, playfield)).toList();
    this.updateBlocks();
  }

  updateBlocks():void {
    this.blocks.forEach((block, index) => block.position = this.shape.points.toList().get(index).add(this.position));
  }

  points():Iterable<number, PointInt> { return this.blocks.map(block => block.position); }
  transition(func:() => any):void {
    func();
    this.updateBlocks();
  }

  move(x: number, y: number):void {
    this.transition(() => this.position = this.position.add(new PointInt(x, y)));
  }
  rotate():void {
    this.transition(() => this.shape = this.shape.rotateLeft());
  }
  checkRotate():Polyomino {
    return this.shape.rotateLeft();
  }
  draw():void {
    this.blocks.forEach(block => block.cell.draw());
  }
  toString():string {
    return this.shape.render();
  }
}
