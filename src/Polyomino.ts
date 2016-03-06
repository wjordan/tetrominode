import {PointInt} from "./PointInt";
import {Set, List, Range} from 'immutable';

export class Polyomino {
  public points: Set<PointInt>;

  constructor(points: Set<PointInt>) {
    // Translate a fixed polyomino into canonical form.
    // One or more cells with x=0, one or more with y=0, no negative indices.
    var min:PointInt = new PointInt(points.minBy(p => p.x).x, points.minBy(p => p.y).y);
    this.points = points.map(p => p.subtract(min)).toSet();
    // For subclasses of polyominoes with symmetries, canonical form is the sorted-first element.
    const symmetries = this.symmetries();
    this.points = symmetries.sort().first().points;
  }

  equals(other) { return this.points.equals(other.points); }
  hashCode() { return this.points.hashCode(); }
  toString() { return `{${this.points.sort().map(p => p.toString()).join(', ')}}`; }

  private static MONO = Set.of(new Polyomino(Set.of(new PointInt(0,0))));
  static get(order: number): Set<Polyomino> {
    return order == 1 ? this.MONO : this.grow(this.get(order - 1));
  }

  // Grow a new higher-order polyomino set by adding an extra cell.
  private static grow(polyominoes: Set<Polyomino>): Set<Polyomino> {
    return Set<Polyomino>(polyominoes.flatMap(poly =>
      poly.points.flatMap(point =>
        point.steps().filterNot(p =>
          poly.points.includes(p)
        ).map(point =>
          new this(poly.points.add(point))
        ))));
  }

  transform(f: (point:PointInt) => PointInt): Polyomino {
    return new Polyomino(this.points.map(f).toSet());
  }

  symmetries(): Set<Polyomino> {
    return Set.of(this);
  }

  rotateRight(): Polyomino {
    return this.transform(p => new PointInt(p.y, -p.x));
  }

  rotations(): Set<Polyomino> {
    return Range(1, 4).reduce(r => {
      return r.add(r.last().rotateRight());
    }, Set.of(<Polyomino>this));
  }

  reflections(): Set<Polyomino> {
    return List.of(1, -1).flatMap(i => List.of(1, -1).map(j =>
      this.transform(point => point.scale(new PointInt(i, j)))
    )).toSet();
  }
}
