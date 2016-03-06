import {Set, List} from 'immutable';

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

  // Apply a unary operation to both x and y, returning a new Point.
  applyBoth(f: (i: number) => number):T {
    return Set.of(0, 1).reduce((val, index) => val.update(index, f), this.create(this.x, this.y));
  }

  // Apply a unary operation to x and y separately, returning a List of the resulting objects.
  xy(f: (i: number) => number):List<T> {
    return Set.of(0, 1).map(i => this.update(i, f)).toList();
  }

  // Apply a binary operation with another Point.
  apply(other:T, f: (a:number, b:number) => number):T {
    return this.create(f(this.x, other.x), f(this.y, other.y));
  }

  add(p: T) { return this.apply(p, (a, b) => a + b); }
  subtract(p: T) { return this.apply(p, (a, b) => a - b); }
  scale(p: T) { return this.apply(p, (a, b) => a * b); }
}
