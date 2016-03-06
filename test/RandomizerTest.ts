import {BagRandomizer} from '../src/Randomizer';
import { expect } from 'chai';
import Immutable = require('immutable');
import {OneSidedPolyomino} from "../index";

describe('BagRandomizer', () => {
  const polyominoes = OneSidedPolyomino.get(4);

  it('should get a full bag of polyominoes', () => {
    const random = new BagRandomizer(0);
    const bag = Immutable.Set(Immutable.Range(0, polyominoes.size).map(i => {
      return random.getNextPiece();
    }));
    expect(bag.sort().toString()).to.equal(polyominoes.sort().toString());
  });

  it('should get a different random bag each time', () => {
    const random = new BagRandomizer(0);
    var bag = Immutable.Set(Immutable.Range(0, polyominoes.size).map(_ =>
      random.getNextPiece()
    ));
    var nextBag = Immutable.Set(Immutable.Range(0, polyominoes.size).map(_ =>
      random.getNextPiece()
    ));
    expect(nextBag.toString()).not.to.equal(bag.toString());
  })
});