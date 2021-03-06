import {BagRandomizer} from "../src/Randomizer";
import { expect } from "chai";
import {Set, Range} from "immutable";
import {OneSidedPolyomino} from "polyomino";

describe("BagRandomizer", () => {
  const polyominoes = OneSidedPolyomino.get(4);

  it("should get a full bag of polyominoes", () => {
    const random = new BagRandomizer(0);
    const bag = Set(Range(0, polyominoes.size).map(i => {
      return random.getNextShape();
    }));
    expect(bag.map((index, poly) => poly).sort().toString()).to.equal(polyominoes.sort().toString());
  });

  it("should get a different random bag each time", () => {
    const random = new BagRandomizer(0);
    const bag = Set(Range(0, polyominoes.size).map(() =>
      random.getNextShape()
    ));
    const nextBag = Set(Range(0, polyominoes.size).map(() =>
      random.getNextShape()
    ));
    expect(nextBag.toString()).not.to.equal(bag.toString());
  });
});
