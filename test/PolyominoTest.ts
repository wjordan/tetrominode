import { Polyomino, FreePolyomino, OneSidedPolyomino } from '../index';
import { expect } from 'chai';

describe('Polyomino', () => {
  describe('Enumerate polyominoes', () => {
    it('should enumerate the fixed polyominoes', () => {
      const fixedTetrominoes = Polyomino.get(4);
      expect(fixedTetrominoes.size).to.equal(19);
    });

    it('should enumerate the free polyominoes', () => {
      const freeTetrominoes = FreePolyomino.get(4);
      expect(freeTetrominoes.size).to.equal(5);
    });

    it('should enumerate the one-sided polyominoes', () => {
      const oneSidedTetrominoes = OneSidedPolyomino.get(4);
      expect(oneSidedTetrominoes.size).to.equal(7);
    });
  });
});
