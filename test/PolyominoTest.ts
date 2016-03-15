import { expect } from "chai";
import {Polyomino} from "../src/Polyomino";
import {FreePolyomino} from "../src/FreePolyomino";
import {OneSidedPolyomino} from "../src/OneSidedPolyomino";
import {PolyPiece} from "../src/PolyPiece";

describe("Polyomino", () => {
  describe("Enumerate polyominoes", () => {
    it("should enumerate the fixed polyominoes", () => {
      const fixedTetrominoes = Polyomino.get(4);
      expect(fixedTetrominoes.size).to.equal(19);
    });

    it("should enumerate the free polyominoes", () => {
      const freeTetrominoes = FreePolyomino.get(4);
      expect(freeTetrominoes.size).to.equal(5);
    });

    it("should enumerate the one-sided polyominoes", () => {
      const oneSidedTetrominoes = OneSidedPolyomino.get(4);
      expect(oneSidedTetrominoes.size).to.equal(7);
    });

    it("should apply offsets consistently", () => {
      const rotations = OneSidedPolyomino.get(4).toList().flatMap(poly => poly.rotationsWithDuplicates());
      console.log(`tetrominoes:\n${rotations.map(poly => poly.toString2()).join("\n\n")}`);
      expect(rotations.size).to.equal(28);
    });

    it("should enumerate PolyPieces with offsets", () => {
      const pieces:Immutable.Set<PolyPiece> = OneSidedPolyomino.get(4)
        .map(shape => new PolyPiece(shape, 0)).toSet();
      console.log(`tetrominoes:\n${pieces.map(poly => poly.toString2()).join("\n\n")}`);
      // expect(rotations.size).to.equal(28);
    });
  });
});
