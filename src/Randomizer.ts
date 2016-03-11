import {List, Set} from "immutable";
import Random = require("random-js");
import {Polyomino} from "./Polyomino";
import {OneSidedPolyomino} from "./OneSidedPolyomino";

export interface Randomizer {
  getNextShape(): [number, Polyomino];
  getShapes(): Set<Polyomino>;
}

abstract class RandRandomizer implements Randomizer {
  public shapes = OneSidedPolyomino.get(4);
  engine:Engine;
  constructor(seed:number) {
    this.engine = Random.engines.mt19937();
    (<MT19937>this.engine).seed(seed);
  }
  getShapes():Set<Polyomino> {
    return this.shapes;
  }
  abstract getNextShape();
}

export class BagRandomizer extends RandRandomizer {
  bag:List<Polyomino>;
  newBag() { return List(Random.shuffle(this.engine, this.shapes.toArray())); }
  getNextShape():[number, Polyomino] {
    if (this.bag === undefined || this.bag.isEmpty()) {
      this.bag = this.newBag();
    }
    const polyomino = this.bag.last();
    this.bag = this.bag.pop();
    return [this.shapes.toIndexedSeq().indexOf(polyomino), polyomino];
  }
}

export class MemorylessRandomizer extends RandRandomizer {
  getNextShape():[number, Polyomino] {
    const shape = Random.pick(this.engine, this.shapes.toArray());
    return [this.shapes.toIndexedSeq().indexOf(shape), shape];
  }
}
