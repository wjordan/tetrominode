import {Set} from "immutable";
import {PointInt, Polyomino} from "polyomino";

class EmptyPolyomino extends Polyomino {
  constructor() { super(Set<PointInt>()); }
  public symmetries(): Set<Polyomino> { return Set.of(this); }
}
export const emptyPolyomino = new EmptyPolyomino();
