import Immutable = require('immutable');
import {OneSidedPolyomino, Polyomino} from '../index';
import List = Immutable.List;
import Random = require('random-js');

export interface Randomizer {
  getNextPiece(): Polyomino;
}

abstract class RandRandomizer implements Randomizer {
  public shapes = OneSidedPolyomino.get(4);
  engine:Engine;
  constructor(seed:number) {
    this.engine = Random.engines.mt19937();
    (<MT19937>this.engine).seed(seed);
  }
  abstract getNextPiece();
}

export class BagRandomizer extends RandRandomizer {
  bag:List<Polyomino>;
  newBag() { return List(Random.shuffle(this.engine, this.shapes.toArray())); }
  getNextPiece():Polyomino {
    if(this.bag == null || this.bag.isEmpty()) this.bag = this.newBag();
    const polyomino = this.bag.last();
    this.bag = this.bag.pop();
    return polyomino;
  }
}

export class MemorylessRandomizer extends RandRandomizer {
  getNextPiece() {
    return Random.pick(this.engine, this.shapes.toArray());
  }
}
