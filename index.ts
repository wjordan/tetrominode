#!/usr/bin/env node
import Immutable = require('immutable');

class Point {
  constructor(public x: number, public y: number) {}
  static from(x: Point|number, y?: number) {
    return (x instanceof Point) ? [x.x, x.y] : [<number>x, y];
  }
  scale(scale: number) {
    return new Point(this.x * scale, this.y * scale);
  }
  add(x: Point|number, y?: number) {
    [x,y] = Point.from(x,y);
    return new Point(this.x + <number>x, this.y + y);
  }
  subtract(x: Point|number, y?: number) {
    [x,y] = Point.from(x,y);
    return new Point(this.x - <number>x, this.y - y);
  }
  equals(other) {
    return this.x == other.x && this.y == other.y;
  }
  toString() { return `{x: ${this.x}, y: ${this.y}}`;}
}

class Polyomino {
  public points: Immutable.Set<Point>;
  normalize() {
    const minX = this.points.map(point => point.x).min();
    const minY = this.points.map(point => point.y).min();
    this.points = Immutable.Set(this.points.map(point => point.subtract(minX, minY)));
  }
  static fromPoints(...points:number[][]) {
    const pointObjects = points.map(point => new Point(point[0], point[1]));
    return new Polyomino(Immutable.Set(pointObjects));
  }
  static from(...points:Point[]) {
    return new Polyomino(Immutable.Set(points));
  }
  constructor(points: Immutable.Set<Point>) {
    this.points = points;
    this.normalize();
  }
  equals(other: Polyomino) {
    this.normalize();
    other.normalize();
    return this.points.equals(other.points);
  }
  toString() { return `Polyomino: ${this.points}`; }
}

// Single step in all four cardinal directions from the provided point.
function cardinalSteps(point: Point): Point[] {
  return [1, -1].map(z => point.x + z).map(x => new Point(x, point.y)).concat(
    [1, -1].map(z => point.y + z).map(y => new Point(point.x, y)));
}

const monomino = Immutable.Set([Polyomino.fromPoints([0,0])]);
function getPolyominoes(order: number) {
  if(order == 1) {
    return monomino;
  }
  return createPolyominoes(getPolyominoes(order-1));
}

function createPolyominoes(polyominoes: Immutable.SetIterable<Polyomino>): Immutable.SetIterable<Polyomino> {
  var polyominoSet = <Immutable.SetIterable<Polyomino>>polyominoes.flatMap(polyomino => {
    return polyomino.points.flatMap(point => {
      return cardinalSteps(point).map(point => {
        return new Polyomino(polyomino.points.add(point)));
      }
    });
  });
  polyominoSet = polyominoSet.filter(poly => poly.points.size == polyominoes.first().points.size + 1);
  // If Immutable.Set removed duplicates correctly, this extra step shouldn't be necessary.
  var finalSet = Immutable.Set([]);
  polyominoSet.forEach(p => {
    if(!finalSet.contains(p)) {
      finalSet = finalSet.add(p);
    }
  });
  return finalSet;
}

[
  'mon',
  'd',
  'tr',
  'tetr',
  'pent',
  'hex'
].map((x, index) => console.log(`there are ${getPolyominoes(index+1).size} fixed ${x}ominoes.`));
