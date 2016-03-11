import {Set} from "immutable";
import {Polyomino} from "./Polyomino";
import {PointInt} from "./PointInt";

class EmptyPolyomino extends Polyomino {
  constructor() { super(Set<PointInt>()); }
  symmetries():Set<Polyomino> { return Set.of(this); }
}
export const emptyPolyomino = new EmptyPolyomino();
