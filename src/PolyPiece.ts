import {Polyomino} from "./Polyomino";
import {PointInt} from "./PointInt";
import {OneSidedPolyomino} from "./OneSidedPolyomino";

export class PolyPiece extends Polyomino {
  static ORDER:string = "TJOZLSI";
  static START = {
    tgm: {
      T: 3,
      J: 3,
      L: 3,
      S: 1,
      I: 1
    }
  };
  // After start-rotation offsets have been applied.
  static OFFSET = {
    tgm: {
      T: [
        [0, 1], [1, 0], [0, 1], [0, 0]
      ],
      J: [
        [0, 1], [1, 0], [0, 1], [0, 0]
      ],
      O: [
        [1, 1]
      ],
      Z: [
        [0, 1], [1, 0]
      ],
      L: [
        [0, 1], [1, 0], [0, 1], [0, 0]
      ],
      S: [
        [0, 1], [0, 0]
      ],
      I: [
        [0, 1], [2, 0]
      ]
    }
  };

  static _polyCache = {};
  constructor(public poly:OneSidedPolyomino, public rotationIndex:number = 0) {
    super(poly.points);
    const rotations = poly.rotations().toList();
    rotationIndex = rotationIndex % rotations.size;
    const polySize = poly.points.size;
    PolyPiece._polyCache[polySize] = PolyPiece._polyCache[polySize] || OneSidedPolyomino.get(polySize).toIndexedSeq();
    const index:number = PolyPiece._polyCache[polySize].indexOf(poly);
    const id = PolyPiece.ORDER[index];
    const start:number = PolyPiece.START.tgm[id] || 0;
    const rotArray = PolyPiece.OFFSET.tgm[id];
    const [rotOffsetX, rotOffsetY] = rotArray[rotationIndex % rotArray.length];
    const rotOffset = new PointInt(rotOffsetX, rotOffsetY);
    this.points = rotations.get((start + rotationIndex) % rotations.size).points.map(p => p.add(rotOffset)).toSet();
  }

  rotateLeft():Polyomino {
    return new PolyPiece(this.poly, this.rotationIndex + 1);
  }
}
