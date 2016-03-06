import { expect } from 'chai';
import {PointInt} from "../src/PointInt";

describe('Point', () => {
  it('should applyAll', () => {
    const point = new PointInt(1, 0);
    const newPoint = point.applyBoth(z => {console.log(`z=${z}, maxmin=${Math.max(1, Math.min(-1, z))}`); return Math.max(1, Math.min(-1, z))});
    console.log(`newpoint=${newPoint}`);
    expect(newPoint.x).to.equal(1);
    expect(newPoint.y).to.equal(0);
  });
});
