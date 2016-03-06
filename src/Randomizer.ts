import Immutable = require('immutable');
import List = Immutable.List;
import Random = require('random-js');
import {Polyomino} from "./Polyomino";
import {OneSidedPolyomino} from "./OneSidedPolyomino";

export interface Randomizer {
  getNextShape(): Polyomino;
}

abstract class RandRandomizer implements Randomizer {
  public shapes = OneSidedPolyomino.get(4);
  engine:Engine;
  constructor(seed:number) {
    this.engine = Random.engines.mt19937();
    (<MT19937>this.engine).seed(seed);
  }
  abstract getNextShape();
}

export class BagRandomizer extends RandRandomizer {
  bag:List<Polyomino>;
  newBag() { return List(Random.shuffle(this.engine, this.shapes.toArray())); }
  getNextShape():Polyomino {
    if(this.bag == null || this.bag.isEmpty()) this.bag = this.newBag();
    const polyomino = this.bag.last();
    this.bag = this.bag.pop();
    return polyomino;
  }
}

export class MemorylessRandomizer extends RandRandomizer {
  getNextShape() {
    return Random.pick(this.engine, this.shapes.toArray());
  }
}
