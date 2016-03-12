import {List} from "immutable";
import Random = require("random-js");
import {Polyomino} from "./Polyomino";
import {OneSidedPolyomino} from "./OneSidedPolyomino";
import Set = Immutable.Set;
import {PolyPiece} from "./PolyPiece";
import {PointInt} from "./PointInt";

export interface Randomizer {
  getNextShape(pop:boolean): [number, Polyomino];
  getShapes(): Set<Polyomino>;
}

abstract class RandRandomizer implements Randomizer {
  public shapes = this.getShapes();
  engine:Engine;
  constructor(seed:number) {
    this.engine = Random.engines.mt19937();
    (<MT19937>this.engine).seed(seed);
  }

  getShapes():Set<Polyomino> {

    const startRot = {
      tgm: {
        S: 1
      }
    };
    // After start rotations have applied.
    const rotOffset = {
      tgm: {
        T: [
          [0, 1], [0, 0], [0, 1], [1, 0]
        ],
        J: [
          [0, 1], [0, 0], [0, 1], [1, 0]
        ],
        O: [
          [1, 1]
        ],
        S: [
          [0, 1], [0, 0]
        ],
        L: [
          [0, 1], [0, 0], [0, 1], [1, 0]
        ],
        Z: [
          [0, 1], [1, 0]
        ],
        I: [
          [0, 1], [2, 0]
        ]
      }
    };
    const shapes = OneSidedPolyomino.get(4);
    return shapes.toIndexedSeq().map((shape, index) => {
      const tetrominoOrder = "TJOSLZI";
      const id = tetrominoOrder[index];
      const start:number = startRot.tgm[id] || 0;
      const [rotOffsetX, rotOffsetY] = rotOffset.tgm[id][start];
      const rot = new PointInt(rotOffsetX, rotOffsetY);
      console.log(`new polypiece ${id}, rotOffset=${rot}, start=${start}`);
      const rotatedShape = shape.rotations().toList().get(start);
      console.log(`shape:\n${rotatedShape.toString2()}`);
      return new PolyPiece(rotatedShape, rot);
    }).toSet();
  }
  abstract getNextShape();
}

export class BagRandomizer extends RandRandomizer {
  bag:List<Polyomino>;
  newBag() { return List(Random.shuffle(this.engine, this.shapes.toArray())); }
  getNextShape(pop:boolean = false):[number, Polyomino] {
    if (this.bag === undefined || this.bag.isEmpty()) {
      this.bag = this.newBag();
    }
    const polyomino = this.bag.last();
    if (pop) {
      this.bag = this.bag.pop();
    }
    return [this.shapes.toIndexedSeq().indexOf(polyomino), polyomino];
  }
}

export class MemorylessRandomizer extends RandRandomizer {
  getNextShape(pop:boolean = false):[number, Polyomino] {
    const shape = Random.pick(this.engine, this.shapes.toArray());
    return [this.shapes.toIndexedSeq().indexOf(shape), shape];
  }
}
