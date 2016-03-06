import {Point} from "./Point";
import {Set, Range} from "immutable";

export class PointInt extends Point<PointInt> {
  static ZERO:PointInt = new PointInt(0, 0);
  constructor(x: number, y: number) {
    super(x|0,y|0);
  }
  range():Set<PointInt> {
    return Set<PointInt>(Range(0, this.x).flatMap(x =>
      Range(0, this.y).map(y =>
        new PointInt(x, y)
      )
    ));
  }
  steps():Set<PointInt> {
    return Set.of(1, -1).flatMap(z => this.xy(x => x + z)).toSet();
  }
}
