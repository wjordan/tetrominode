#!/usr/bin/env node
import * as blessed from "blessed";
// noinspection ES6UnusedImports,TsLint
import * as Immutable from "immutable";
import Map = Immutable.Map;
import Set = Immutable.Set;
import BlessedBox = Blessed.BlessedBox;
import {PointInt} from "./src/PointInt";
import {Cell} from "./src/Cell";
import {
  Playfield, Movement, InputState, Rotation, Drop, Option, GameState, LineClear, Falling,
} from "./src/Playfield";
import BlessedScreen = Blessed.BlessedScreen;
import BlessedLog = Blessed.BlessedLog;
import * as tinycolor from "tinycolor2";
import {Piece} from "./src/Piece";
import {Polyomino} from "./src/Polyomino";

function getShade(fraction:number):string {
  "use strict";
  const chars:string = " ░▒▓ ";
  return chars[Math.round(fraction * 4)];
}

function fractionString(fraction:number):string {
  "use strict";
  const chars:string = " ▁▂▃▄▅▆▇█";
  return chars[Math.round(fraction * 8)];
}

export class View {
  nextPiece:BlessedBox;
  private nextPieceCanvas:Map<PointInt, BlessedBox>;
  private playfield:Playfield;
  private canvas:Map<PointInt, BlessedBox>;
  private lockedPiece:Piece = Piece.EMPTY;
  private static COLORS:[string] = [
    "brightred",
    "brightgreen",
    "brightyellow",
    "brightblue",
    "brightmagenta",
    "brightcyan",
    "brightwhite",
  ];

  private numShapes:number;
  constructor(public screen:BlessedScreen, public logger:BlessedLog) {}
  setPlayfield(playfield:Playfield) {
    this.playfield = playfield;
    this.numShapes = playfield.bag.getShapes().size;
    this.canvas = playfield.grid.map((cell:Cell, point:PointInt) => {
      const pieceType = cell.block.pieceType;
      const box = blessed.box({
        screen:this.screen,
        width: 2,
        height: 1,
        left: point.x * 2,
        top: point.y,
        bg: "black",
        fg: "white",
        content: pieceType === -1 ? "  " : `${pieceType}${pieceType}`,
      });
      this.screen.append(box);
      return box;
    }).toMap();

    const maxSize:number = <number>(playfield.bag.getShapes().flatMap(poly => poly.points.flatMap(p => p.toArray())).max()) + 1;
    this.nextPiece = blessed.box({
      screen:this.screen,
      width: maxSize * 2,
      height: maxSize,
      left: 6,
      top: 0,
    });
    this.screen.append(this.nextPiece);
    this.nextPieceCanvas = Map<PointInt, BlessedBox>(new PointInt(maxSize, maxSize).range().map(point => {
      const box = blessed.box({
        screen:this.screen,
        width: 2,
        height: 1,
        left: point.x * 2,
        top: point.y,
        bg: "black",
        fg: "white",
        content: "  ",
      });
      this.nextPiece.append(box);
      return [point, box];
    }));
    this.log(`NextPieceCanvas[0,0] = ${this.nextPieceCanvas.get(PointInt.ZERO)}`);
  }
  lockPiece():void {
    this.lockedPiece = this.playfield.piece;
  }

  drawNextPiece():void {
    const [pieceType, piece]:[number, Polyomino] = this.playfield.bag.getNextShape(false);
    const points:Set<PointInt> = piece.points;
    this.nextPieceCanvas.valueSeq().forEach(box => box.style.bg = "black");
    points.forEach(point => {
      const box = this.nextPieceCanvas.get(point);
      if (box) {
        // In 256-color mode, distribute piece colors evenly across color spectrum
        const hue = (360 * pieceType / this.numShapes);
        box.style.bg = this.screen.tput.numbers.max_colors > 8 ?
          tinycolor({h: hue, s: 100, v: 100}).toHexString() :
          View.COLORS[pieceType];
      }
    });
  }

  drawCell(position:PointInt):void {
    const movingDown:boolean = !this.playfield.cantMoveDown;
    const box:BlessedBox = this.canvas.get(position);
    if (box) {
      const points = this.playfield.piece.points();
      const pieceAbove:boolean = points.contains(position.add(new PointInt(0, -1)));
      const pieceBelow:boolean = points.contains(position.add(new PointInt(0, 1)));
      let pieceType = this.playfield.grid.get(position).block.pieceType;
      const isBlock = pieceType !== -1;
      const isActivePiece = points.contains(position);
      if (!isBlock &&
        (!movingDown || !pieceAbove)
      ) {
        box.style.bg = "black";
        box.content = "  ";
        return;
      }

      if (pieceType === -1) {
        pieceType = this.playfield.grid.get(position.add(new PointInt(0, -1))).block.pieceType;
        if (pieceType === -1) {
          box.style.bg = "black";
          box.content = "  ";
          return;
        }
      }
      // In 256-color mode, distribute piece colors evenly across color spectrum
      const hue = (360 * pieceType / this.numShapes);
      const lockValue:number = !isActivePiece ? 1 : (1 - (this.playfield.lockCounter / this.playfield.playMode.maxLockDelay));

      const flashPiece = isActivePiece && this.lockedPiece === this.playfield.piece;
      const pieceColor = flashPiece ? "brightwhite" :
        this.screen.tput.numbers.max_colors > 8 ?
          tinycolor({h: hue, s: 100, v: lockValue * 100}).toHexString() :
          View.COLORS[pieceType];

      box.style.fg = pieceColor;
      box.style.bold = flashPiece ? true : undefined;
      let str:string = flashPiece ? "█" : getShade(lockValue);
      box.style.bg = str === " " ? pieceColor : "black";
      let shiftDown:number = 0;
      const gravity = this.playfield.gravityCounter;
      if (movingDown) {
        if (isActivePiece) {
          if (!pieceAbove) {
            shiftDown = gravity;
            box.style.bg = "black";
          }
          if (!pieceBelow) {
            this.drawCell(position.add(new PointInt(0, 1)));
          }
        } else if (pieceAbove) {
          box.style.fg = "black";
          shiftDown = gravity;
        }
      }
      if (shiftDown > 0) {
        str = fractionString(1 - shiftDown);
      }
      box.content = `${str}${str}`;
    }
  }

  log(message:string):void {
    this.logger.log(message);
  }

  setState(s:GameState) {
    this.lockedPiece.draw();
    if (s instanceof LineClear) {
      setTimeout(() => this.lockedPiece = Piece.EMPTY, 1000 / 60 * 5);
    }
    if (s instanceof Falling) {
      this.drawNextPiece();
    }
  }
}

// Create a screen object.
const screen:BlessedScreen = blessed.screen({
  program: blessed.program({
    tput: true,
  }),
});
const logger:BlessedLog = blessed.log({
  parent:screen,
  width: 40,
  height: 30,
  left: 30,
  top: 0,
  scrollback: 30,
});

const view:View = new View(screen, logger);

const playfield:Playfield = new Playfield(view);

const input:InputState = new InputState(Movement.None, Drop.None, Rotation.None, Option.None);

screen.render();
screen.key(["q"], () => {
  input.option = Option.End;
  logger.log("exit!");
  process.exit(0);
});

screen.key(["space"], () => {
  input.drop = Drop.Hard;
});

screen.key(["up"], () => {
  input.rotation = Rotation.Right;
});

screen.key(["d"], () => {
  input.drop = Drop.Soft;
});

screen.key(["down"], () => {
  input.drop = Drop.Soft;
  screen.render();
});

screen.key(["left"], () => {
  input.movement = Movement.Left;
});

screen.key(["right"], () => {
  input.movement = Movement.Right;
});

setInterval(
  () => {
    playfield.update(input);
    // playfield.grid.forEach(cell => cell.draw());
    playfield.piece.draw();
    screen.render();
    input.clear();
  },
  1000 / 60
);
