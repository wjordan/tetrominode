import {Polyomino} from "./Polyomino";
import {PointInt} from "./PointInt";

export class PolyPiece extends Polyomino {
  constructor(public poly:Polyomino, public position:PointInt = PointInt.ZERO) {
    super(poly.points);
    this.points = this.points.map(p => p.add(position)).toSet();
  }
}
