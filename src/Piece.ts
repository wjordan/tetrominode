import BlessedBox = Blessed.BlessedBox;
import {PointInt} from "./PointInt";
import {Polyomino} from "./Polyomino";
import {Block} from "./Block";

/**
 * A single polyomino piece in a fixed position/rotation.
 * Contains a set of Blocks.
 */
export class Piece {
  public canvas: Immutable.Map<PointInt, BlessedBox>;
  public shape:Polyomino;
  public position:PointInt;
  public blocks:Immutable.List<Block>;

  constructor(shape: Polyomino, canvas, playfield) {
    this.shape = shape;
    this.position = new PointInt(0, 0);
    this.canvas = canvas;
    this.blocks = this.shape.points.toList().map((point, index) => new Block(point.add(this.position), index.toString(), playfield)).toList();
    this.updateBlocks();
    this.draw(true);
  }

  updateBlocks() {
    this.blocks.forEach((block, index) => block.position = this.shape.points.toList().get(index).add(this.position));
  }

  points() { return this.blocks.map(block => block.position); }
  transition(func) {
    this.up();
    func();
    this.updateBlocks();
    this.down();
  }

  move(x: number, y: number) {
    this.transition(_ => this.position = this.position.add(new PointInt(x, y)));
  }
  rotate() {
    this.transition(_ => this.shape = this.shape.rotateRight());
  }
  checkRotate() {
    return this.shape.rotateRight();
  }

  up() { this.draw(false); }
  down() { this.draw(true); }
  draw(fill:boolean) {
    this.points().forEach((point, index) => {
      const box:BlessedBox = this.canvas.get(point);
      if(box) {
        const str = this.blocks.get(index).type.toString();
        box.content = fill ? `${str}${str}` : ' .';
      }
    });
  }
}
