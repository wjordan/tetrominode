#!/usr/bin/env node
import Immutable = require('immutable');
var Set = Immutable.Set;
type Set<T> = Immutable.Set<T>;
var List = Immutable.List;
type List<T> = Immutable.List<T>;
import gl = require('gl-matrix');
import _ = require('lodash');

class Point {
  constructor(public x: number, public y: number) {}
  create(x: number, y: number) { return new (<any>this).constructor(x, y); }

  toString() { return `[${this.x}, ${this.y}]`;}
  equals(other) { return this.x == other.x && this.y == other.y; }
  hashCode() { return this.x * 31 + this.y; }

  toArray() { return [this.x, this.y]; }
  toList() { return List(this.toArray()); }
  static fromArray(xy: number[]) { return new this(xy[0],xy[1]); }
  fromArray(xy: number[]) { return this.create(xy[0], xy[1]); }
  static fromList(p: List<number>) { return this.fromArray(p.toArray()); }
  fromList(p: List<number>) { return this.fromArray(p.toArray()); }

  // Applies a function to x and y components separately.
  xy(f: (i: number) => any) {
    return Set.of(0, 1).map(i => this.fromList(this.toList().update(i, val => f(val))));
  }

  subtract(p: Point) { return this.create(this.x - p.x, this.y - p.y); }
  scale(x: number, y: number) { return this.create(this.x * x, this.y * y); }

  // Rotate a point x degrees around the origin.
  rotate(degrees: number) {
    const vec = gl.vec2.fromValues(this.x, this.y);
    const mat = gl.mat2.create();
    gl.mat2.rotate(mat, mat, gl.glMatrix.toRadian(degrees));
    gl.vec2.transformMat2(vec, vec, mat);
    return new (<any>this).constructor(vec[0], vec[1]);
  }
}

class PointInt extends Point {
  constructor(x: number, y: number) {
    super(x|0,y|0);
  }
  steps():Set<PointInt> {
    return Set.of(1, -1).flatMap(z => this.xy(p => p + z)).toSet();
  }
}

class Polyomino {
  public points: Set<PointInt>;
  constructor(points: Set<PointInt>) {
    // Translate a fixed polyomino into canonical form.
    // One or more cells with x=0, one or more with y=0, no negative indices.
    var min:PointInt = new PointInt(points.minBy(p => p.x).x, points.minBy(p => p.y).y);
    this.points = points.map(p => p.subtract(min)).toSet();
    // For classes of polyominoes with symmetries, canonical form is the sorted-first element.
    const symmetries = this.symmetries();
    this.points = symmetries.sort().first().points;
  }

  equals(other) { return this.points.equals(other.points); }
  hashCode() { return this.points.hashCode(); }
  toString() { return `{${this.points.sort().map(p => p.toString()).join(', ')}}`; }

  private static MONO = Set.of(new Polyomino(Set.of(new PointInt(0,0))));
  static get(order: number) {
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

  symmetries(): Set<Polyomino> {
    return Set.of(this);
  }

  rotateRight(): Polyomino {
    return new Polyomino(this.points.map(p => new PointInt(p.y, -p.x)).toSet());
  }

  rotations(): Set<Polyomino> {
    return Immutable.Range(1, 4).reduce(r => {
      return r.add(r.last().rotateRight());
    }, Set.of(this));
  }

  reflections(): Set<Polyomino> {
    return List.of(1, -1).flatMap(i => List.of(1, -1).map(j =>
        new Polyomino(this.points.map(point => point.scale(i, j)).toSet())
    )).toSet();
  }
}

class OneSidedPolyomino extends Polyomino {
  symmetries() {
    return this.rotations();
  }
}

class FreePolyomino extends Polyomino {
  symmetries() {
    return this.reflections().flatMap(poly => poly.rotations()).toSet();
  }
}

const fixedTetrominoes = Polyomino.get(4);
console.log(`there are ${fixedTetrominoes.size} fixed tetrominoes:\n${fixedTetrominoes.map(p => p.toString()).join("\n")}`);

const freeTetrominoes = FreePolyomino.get(4);
console.log(`there are ${freeTetrominoes.size} free tetrominoes:\n${freeTetrominoes.map(p => p.toString()).join("\n")}`);
//
const oneSidedTetrominoes = OneSidedPolyomino.get(4);
console.log(`there are ${oneSidedTetrominoes.size} one-sided tetrominoes:\n${oneSidedTetrominoes.map(p => p.toString()).join("\n")}`);
