import {PointInt} from "./PointInt";
import {Randomizer, BagRandomizer} from "./Randomizer";
import {Block} from "./Block";
import BlessedBox = Blessed.BlessedBox;
import {Polyomino} from "./Polyomino";
import {Cell} from "./Cell";
import {Piece} from "./Piece";
// noinspection ES6UnusedImports,TsLint
import * as Immutable from "immutable";
import Set = Immutable.Set;
import Map = Immutable.Map;
import Iterable = Immutable.Iterable;
import List = Immutable.List;
import {PlayMode, EasyMode} from "./PlayMode";
import {View} from "../test";

export const enum Drop { Hard, Soft, None }
export const enum Rotation { Left, Right, None }
export const enum Option { End, AddLine, None, Empty }

// Hack to allow typescript enums to contain value objects
export enum Movement {
  Left = <any>new PointInt(-1, 0),
  Right = <any>new PointInt(1, 0),
  None = <any>PointInt.ZERO
}

/**
 * A two-dimensional grid where the action takes place.
 */
export class Playfield {
  get lockCounter():number {
    return this._lockCounter;
  }

  set lockCounter(value:number) {
    this._lockCounter = value;
    this.piece.draw();
  }

  state:GameState = new Spawn(this);
  playMode:PlayMode = new EasyMode();
  input:InputState = InputState.EMPTY;
  stateCounter:number = 0;
  frameCounter:number = 0;
  gravityCounter:number = 0;
  lineAdd:number = 0;
  rotateVal: Rotation = Rotation.None;

  dasCounter: [Movement, number] = [Movement.None, 0];

  spawnPos:PointInt = new PointInt(3, 3);
  playfieldSize:PointInt = new PointInt(10, 24);
  bag:Randomizer = new BagRandomizer(0);
  canvas:Map<PointInt, BlessedBox>;

  // Currently active Piece on the playfield.
  piece:Piece;
  // Map of Cell spaces potentially occupied by Blocks.
  grid:Map<PointInt, Cell>;
  private _lockCounter:number = 0;

  constructor(public view:View) {
    this.grid = Map<PointInt, Cell>(this.playfieldSize.range().map(point => [point, new Cell(point, this)]));
    view.setPlayfield(this);
    this.stateCounter = this.state.enter();
  }

  public get blocks():Map<PointInt, Block> {
    return this.grid.map((cell, position) => cell.block).toMap();
  }

  public addPiece():void {
    this.piece = new Piece(this.bag.getNextShape(true), this);
    this.piece.position = this.spawnPos;
    this.putPiece();
  }

  removePiece():void {
    this.piece.blocks.map(block => block.cell).forEach(cell => cell.remove());
  }

/** Inserts a Piece / Block into the playfield at its current position.
 *  @return false if the Piece was unable to be placed.
 */
  putPiece():boolean {
    this.removePiece();
    this.piece.updateBlocks();
    if (this.empty(this.piece, this.piece.points())) {
      this.piece.blocks.forEach(block => block.cell.block = block);
      return true;
    } else {
      return false;
    }
  }

  empty(piece:Piece, points:Iterable<number|PointInt, PointInt>):boolean {
    return points.every(point => piece.points().contains(point) || this.grid.get(point, Cell.INVALID).isEmpty);
  }

  rotate(rotateVal:Rotation = Rotation.Right):void {
    if (rotateVal === Rotation.Right) {
      this._rotate();
    } else if (rotateVal === Rotation.Left) {
      this._rotate();
      this._rotate();
      this._rotate();
    }
  }

  /**Rotates the current Piece.
   * @return True if the piece was rotated.
   */
  _rotate():boolean {
    const newPoly:Polyomino = this.piece.shape.rotateLeft();
    const newPiecePos:PointInt = this.canRotate(this.piece, newPoly.points.map(point => point.add(this.piece.position)));
    if (newPiecePos !== PointInt.ZERO) {
      this.piece.position = this.piece.position.add(newPiecePos);
      this.piece.shape = newPoly;
      this.putPiece();
      return true;
    } else {
      return false;
    }
  }

  canRotate(piece:Piece, points:Iterable<number|PointInt, PointInt>):PointInt {
    return Set.of(0, 1, -1)
      .map(x => new PointInt(x, 0)).find(
        point =>
          this.empty(piece, points.map(p => p.add(point))),
        undefined,
        PointInt.ZERO
      );
  }

  move(movement:PointInt):boolean {
    return this._move(movement);
  }

  /**Attempts to move the active Piece up to the specified offset.
   * @return true if the Piece moved any amount.
   */
  _move(offset:PointInt):boolean {
    const newPos:PointInt = this.movePos(offset);
    if (newPos.equals(PointInt.ZERO)) {
      return false;
    } else {
      this.piece.position = this.piece.position.add(newPos);
      this.putPiece();
      return true;
    }
  }

  /**Checks possible movement of the active Piece.
   *  Works for horizontal and vertical movements of any amount.
   * @return the last valid Pos of the Piece before it can't move any further.
   */
  movePos(offset:PointInt):PointInt {
    const incr:PointInt = offset.applyBoth(z => Math.max(-1, Math.min(1, z)));
    return this._movePos(
      PointInt.ZERO,
      offset,
      incr
    );
  }

  /**Recursive function to move the active Piece by increments until it can't be placed.
   */
  _movePos(currentOffset: PointInt, targetOffset: PointInt, incr: PointInt): PointInt {
    const zero:boolean = targetOffset.equals(PointInt.ZERO);
    if (!zero && this.empty(this.piece, this.piece.points().map(point => point.add(currentOffset).add(incr)))) {
      return this._movePos(currentOffset.add(incr), targetOffset.subtract(incr), incr);
    } else {
      return currentOffset;
    }
  }

  public incDAS(movement:Movement):void {
    if (movement !== this.dasCounter[0]) {
      this.dasCounter = [movement, 10];
    } else {
      this.dasCounter[1] -= 1;
    }
  }

  isBlockOut():boolean {
    return this.piece === Piece.EMPTY;
  }

  // Handle horizontal movement, taking the DAS counter into account.
  doMovement(movement:Movement):void {
    if (movement === Movement.None) { return; }
    if (this.moveDAS) {
      this.move(<any>movement);
    } // DAS counter expired
  }

  public get moveDAS(): boolean {
    return (this.dasCounter[1] <= 0 || this.dasCounter[1] === 10);
  }

  public get cantMoveDown() : boolean {
    return (this.movePos(new PointInt(0, 1)) === PointInt.ZERO);
  }

  public get pieceLocked(): boolean {
    if (this.cantMoveDown) {
      this.lockCounter += 1;
    }
    return (this.lockCounter >= this.playMode.maxLockDelay);
  }

  // Handle vertical movement and piece locking.
  public doGravity(drop: Drop):void {
  // User supplied drop movements
    let dropVal:number = 0;
    if (drop === Drop.Hard) {
      dropVal = 20;
    } else if (drop === Drop.Soft) {
      dropVal = 1;
    } else if (drop === Drop.None) {
      dropVal = 0;
    }

    // Make the piece fall extra from gravity
    this.gravityCounter += this.playMode.gravity;
    if (this.gravityCounter > 1) {
      const gcRound:number = Math.floor(this.gravityCounter);
      this.gravityCounter -= gcRound;
      dropVal += gcRound;
    }
    // Do the actual vertical movement
    const moved:boolean = this.move(new PointInt(0, dropVal));
    // Reset the lock counter if there was any vertical movement
    if (moved) {
      this.lockCounter = 0;
    }
    // Lock the piece if it touches the ground on a soft drop
    if (this.pieceLocked || (this.cantMoveDown && drop === Drop.Soft)) {
      this.lockPiece();
      this.setState(new LineClear(this));
    }
  }

  /**
   * Advances a single frame through a finite state machine.
   * Expect this to be called 60 frames per second (standard definition of 'frame' in most Tetris games)
   */
  update(input:InputState = InputState.EMPTY):void {
    this.run(input);
    this.playMode.update();
  }

  setNewPiece(rotation:Rotation) {
    this.addPiece();
    return this.piece;
  }

  /**Enters a new game state, updating the timer counter.
   * @return the updated timer counter (so state redirects can be chained)
   */
  setState(s: GameState):number {
    this.view.setState(s);
    this.state = s;
    this.stateCounter = this.state.enter();
    // this.notifyView(_.updateState)
    return this.stateCounter;
  }

  // Executes a single frame of the state machine.
  run(c: InputState = InputState.EMPTY): void {
    this.input = c;
    if (this.state instanceof GameOver) {
      return;
    }

    if (c.option === Option.Empty) {
      return;
    }

    if (c.option === Option.End) {
      this.view.log("End!");
      this.setState(new GameOver(this));
    }
    if (c.option === Option.AddLine) { this.lineAdd += 1; }
    // battleEffects.foreach(_.run)
    this.incDAS(c.movement);
    this.stateCounter -= 1;
    if (this.stateCounter === 0) {
      this.setState(this.state.exit());
    } else {
      this.state.run();
    }

    // Increase total frame counter at the end of the frame
    this.frameCounter += 1;
  }

  // This simple logic causes rotations to occur only once per unique button input.
  needsRotate(rotation: Rotation): boolean {
    if (this.rotateVal === rotation) {
      return false;
    } else {
      this.rotateVal = rotation;
      return true;
    }
  }

  /**Checks for cleared lines, removing the Blocks from their Cells.
   * @return true if one or more lines were cleared.
   */
  checkLineClears():Iterable<number, List<Cell>> {
    const clearedRows:Iterable<number, List<Cell>> = this.grid.keySeq().map(point => point.y).toSet().map(y =>
      this.grid.filter((v, key) => key.y === y).toList()
    ).toMap().filter(row => row.every(cell => !cell.isEmpty));
    clearedRows.forEach(row => row.forEach(cell => cell.remove()));
    return clearedRows.sortBy(row => row.first().position.y);
  }

  private lockPiece():void {
    this.lockCounter = 0;
    this.view.lockPiece();
  }
}

export abstract class GameState {
  constructor(public playfield:Playfield) {}

  // Executed once per frame.
  run():void { /* */ }

  /**Called when the state is first entered
   * @return the number of frames before the state expires
   */
  enter():number { return -1; }

  /**Called when the state's counter expires.
   * @return the new State to enter.
   */
  exit():GameState { return new GameOver(this.playfield); }
}

class GameOver extends GameState {
  enter() {
    this.playfield.view.log("Game OVER!");
    return -1;
  }
}

export class Spawn extends GameState {
  enter():number {
    const setNewPiece = this.playfield.setNewPiece(this.playfield.input.rotation);
    this.playfield.view.log(`newPiece:${setNewPiece}`);
    return setNewPiece ? 1 :
      this.playfield.setState(new GameOver(this.playfield));
  }
  exit():GameState {
    return new Falling(this.playfield);
  }
}

export class Falling extends GameState {
  enter():number {
    this.playfield.rotateVal = this.playfield.input.rotation;
    return -1;
  }

  run() {
    // 1. Rotation / Wall Kicks
    if (this.playfield.needsRotate(this.playfield.input.rotation)) {
      this.playfield.rotate(this.playfield.rotateVal);
    }
    // 2. Check for "block out"
    if (this.playfield.isBlockOut()) {
      this.playfield.setState(new GameOver(this.playfield));
    }
    // 3. Lateral Movement
    this.playfield.doMovement(this.playfield.input.movement);
    // 4. Gravity / Line clears
    this.playfield.doGravity(this.playfield.input.drop);
  }
}

export class LineClear extends GameState {
  clearedLines:Iterable<number, List<Cell>>;

  enter():number {
    this.playfield.playMode.pieceLock();
    this.clearedLines = this.playfield.checkLineClears();
    if (!this.clearedLines.isEmpty()) {
      // Send battle effect on 2 or more lines cleared
      // if (clearedBlocks.length >= 2) battleController ! (BattleMessage(new AddLinesEffect(clearedBlocks), TetrionState.this))
      this.playfield.playMode.lineClear(this.clearedLines.size);
      // Extra delay is added when line(s) are cleared
      return this.playfield.playMode.lineClearDelay;
    } else {
      return this.playfield.setState(new Are(this.playfield));
    }
  }

  exit():GameState {
    const keySeq:Immutable.Seq.Indexed<number> = this.clearedLines.keySeq();
    this.playfield.view.log(`ClearedLines!=${keySeq.toArray()}`);
    this.clearedLines.forEach(row => row.forEach(cell => cell.shiftDown()));
    return new Are(this.playfield);
  }

}

// Are is the delay in between piece lock and next piece spawn
export class Are extends GameState {
  enter() {
    return this.playfield.playMode.are;
  }

  exit():GameState {
    return new Spawn(this.playfield);
  }
}

export class InputState {
  static EMPTY:InputState = new InputState(Movement.None, Drop.None, Rotation.None, Option.None);
  clear():void {
    this.movement = Movement.None;
    this.drop = Drop.None;
    this.rotation = Rotation.None;
    this.option = Option.None;
  }
  toString():string { return `${this.movement},${this.drop},${this.rotation},${this.option}`; }
  constructor(public movement:Movement, public drop: Drop, public rotation: Rotation, public option: Option) {}
}
