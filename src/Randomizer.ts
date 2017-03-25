import {PolyPiece} from "./PolyPiece";
import {List, Set} from "immutable";
import * as Random from "random-js";
import {OneSidedPolyomino, Polyomino} from "polyomino";

export interface Randomizer {
  getNextShape(pop:boolean): [number, Polyomino];
  getShapes(): Set<Polyomino>;
}

abstract class RandRandomizer implements Randomizer {
  public shapes = this.getShapes();
  engine: Random.Engine;
  constructor(seed:number) {
    this.engine = Random.engines.mt19937();
    (<Random.MT19937>this.engine).seed(seed);
  }

  getShapes(): Set<Polyomino> {
    console.log(`GetShapes!`);
    return OneSidedPolyomino.get(4)
      .map(shape => new PolyPiece(shape, 0)).toSet();
  }
  abstract getNextShape();
}

export class BagRandomizer extends RandRandomizer {
  bag: List<Polyomino>;
  newBag(): List<Polyomino> {
    return List<Polyomino>(Random.shuffle(this.engine, this.shapes.toArray()));
  }

  getNextShape(pop: boolean = false): [number, Polyomino] {
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
  getNextShape(pop: boolean = false): [number, Polyomino] {
    const shape = Random.pick(this.engine, this.shapes.toArray());
    return [this.shapes.toIndexedSeq().indexOf(shape), shape];
  }
}
