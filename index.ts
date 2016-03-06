#!/usr/bin/env node
import Immutable = require('immutable');
var Set = Immutable.Set;
type Set<T> = Immutable.Set<T>;
var List = Immutable.List;
type List<T> = Immutable.List<T>;
import gl = require('gl-matrix');
import _ = require('lodash');

export class Point<T extends Point<any>> {
  constructor(public x: number, public y: number) {}
  create(x: number, y: number):T { return new (<any>this).constructor(x, y); }

  toString() { return `[${this.x}, ${this.y}]`;}
  equals(other) { return this.x == other.x && this.y == other.y; }
  hashCode() { return this.x * 31 + this.y; }

  toArray() { return [this.x, this.y]; }
  toList() { return List(this.toArray()); }
  static fromArray(xy: number[]) { return new this(xy[0],xy[1]); }
  fromArray(xy: number[]):T { return this.create(xy[0], xy[1]); }
  static fromList(p: List<number>) { return this.fromArray(p.toArray()); }
  update(index: number, updater: (value: number) => number): T {
    return this.fromList(this.toList().update(index, val => updater(val)));
  }
  fromList(p: Immutable.Iterable<number, number>):T { return this.fromArray(p.toArray()); }

  // Apply a unary operation to x and y separately, returning a List of the resulting objects.
  xy(f: (i: number) => number):List<T> {
    return Set.of(0, 1).map(i => this.update(i, val => f(val))).toList();
  }

  // Apply a binary operation with another Point.
  apply(other:T, f: (a:number, b:number) => number):T {
    return this.create(f(this.x, other.x), f(this.y, other.y));
  }

  add(p: T) { return this.apply(p, (a, b) => a + b); }
  subtract(p: T) { return this.apply(p, (a, b) => a - b); }
  scale(p: T) { return this.apply(p, (a, b) => a * b); }
}

export class PointInt extends Point<PointInt> {
  constructor(x: number, y: number) {
    super(x|0,y|0);
  }
  range():Set<PointInt> {
    return Set<PointInt>(Immutable.Range(0, this.x).flatMap(x =>
      Immutable.Range(0, this.y).map(y =>
        new PointInt(x, y)
      )
    ));
  }
  steps():Set<PointInt> {
    return Set.of(1, -1).flatMap(z => this.xy(x => x + z)).toSet();
  }
}

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
    return Immutable.Range(1, 4).reduce(r => {
      return r.add(r.last().rotateRight());
    }, Set.of(<Polyomino>this));
  }

  reflections(): Set<Polyomino> {
    return List.of(1, -1).flatMap(i => List.of(1, -1).map(j =>
        this.transform(point => point.scale(new PointInt(i, j)))
    )).toSet();
  }
}

export class OneSidedPolyomino extends Polyomino {
  symmetries() {
    return this.rotations();
  }
}

export class FreePolyomino extends Polyomino {
  symmetries() {
    return this.reflections().flatMap(poly => poly.rotations()).toSet();
  }
}
