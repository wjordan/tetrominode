import {Polyomino} from "./Polyomino";
export class OneSidedPolyomino extends Polyomino {
  symmetries() {
    return this.rotations();
  }
}
