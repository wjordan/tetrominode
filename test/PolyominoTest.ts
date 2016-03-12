import { expect } from "chai";
import {Polyomino} from "../src/Polyomino";
import {FreePolyomino} from "../src/FreePolyomino";
import {OneSidedPolyomino} from "../src/OneSidedPolyomino";

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
      let tetromino_order = "TJOSLZI";
      let start_rot = {
        tgm: {
          S: 1,
          Z: 1
        }
      };
      // After start rotations have applied.
      let rot_offset = {
        tgm: {
          T: [
            [0, 1], [0, 0], [0, 1], [1, 0]
          ],
          J: [
            [0, 1], [0, 0], [0, 1], [1, 0]
          ],
          O: [
            [1, 1]
          ],
          S: [
            [0, 1], [0, 0]
          ],
          L: [
            [0, 1], [0, 0], [0, 1], [1, 0]
          ],
          Z: [
            [0, 1], [1, 0]
          ],
          I: [
            [0, 1], [2, 0]
          ]
        }
      };
      expect(rotations.size).to.equal(28);
    });
  });
});
