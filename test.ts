#!/usr/bin/env node
import * as blessed from "blessed";
import Map = Immutable.Map;
import Set = Immutable.Set;
import BlessedBox = Blessed.BlessedBox;
import {PointInt} from "./src/PointInt";
import {Cell} from "./src/Cell";
import {Playfield, Movement, InputState, Rotation, Drop, Option} from "./src/Playfield";
import BlessedScreen = Blessed.BlessedScreen;
import BlessedLog = Blessed.BlessedLog;
import * as tinycolor from "tinycolor2";

function getShade(fraction:number):string {
  return fraction >= 0.99 ? "█" :
    fraction >= 0.66 ? "▓" :
    fraction >= 0.33 ? "▒" :
    fraction > 0 ? "░" :
    " ";
}

function fractionString(fraction:number):string {
  const chars:string = " ▁▂▃▄▅▆▇█";
  return chars[Math.round(fraction * 8)];
}

export class View {
  private playfield:Playfield;
  private canvas:Map<PointInt, BlessedBox>;
  constructor(public screen:BlessedScreen, public logger:BlessedLog) {}
  setPlayfield(playfield:Playfield) {
    this.playfield = playfield;
    this.canvas = playfield.grid.map((cell:Cell, point:PointInt) => {
      const pieceType = cell.block.pieceType;
      const box = blessed.box({
        screen:this.screen,
//        bold: false,
        width: 2,
        height: 1,
        left: point.x * 2,
        top: point.y,
        bg: "#000000",
        fg: "#ffffff",
        content: pieceType === -1 ? "  " : `${pieceType}${pieceType}`,
      });
      this.screen.append(box);
      return box;
    }).toMap();
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
        box.style.inverse = false;
        box.style.bg = "#000000";
        box.content = "  ";
        return;
      }

      if (pieceType === -1) {
        pieceType = this.playfield.grid.get(position.add(new PointInt(0, -1))).block.pieceType;
        if (pieceType === -1) {
          box.style.inverse = false;
          box.style.bg = "#000000";
          box.content = "  ";
          return;
        }
      }
      const hue = (360 * pieceType / this.playfield.bag.getShapes().size);
      const lockValue:number = !isActivePiece ? 100 : (1 - (this.playfield.lockCounter / this.playfield.playMode.maxLockDelay)) * 100;
      const xterm = (<any>blessed).colors.xterm;
      const pieceColor = xterm[(pieceType % (xterm.length - 1)) + 1];
      // const pieceColor = tinycolor({h: hue, s: 100, v: 100}).toHexString();
      // box.style.inverse = false;
      box.style.bold = true;
      box.style.fg = pieceColor;
      box.style.bg = pieceColor;
      let str:string = getShade(lockValue/100);
      let shiftDown:number = 0;
      const gravity = this.playfield.gravityCounter;
      if (movingDown) {
        if (isActivePiece) {
          if (!pieceAbove) {
            shiftDown = gravity;
            box.style.bg = "#000000";
          }
          if (!pieceBelow) {
            this.drawCell(position.add(new PointInt(0, 1)));
          }
        } else if (pieceAbove) {
          // Invert fg/bg
          box.style.bold = false;
          box.style.fg = "#000000";
          box.style.bg = pieceColor;
          box.style.inverse = false;
          shiftDown = gravity;
        }
      }
      if (shiftDown > 0) {
        str = fractionString(1 - shiftDown);
      }
      box.content = `${str}${str}`;
      if (movingDown && !isActivePiece && pieceAbove) {
        box.style.fg = undefined;
        box.style.bg = undefined;
        box.content = `\x1b[0;30m\x1b[${pieceType + 101}m${str}${str}\x1b[0m`;
      }
    }
  }

  log(message:string):void {
    // this.logger.log(message);
  }
}

// Create a screen object.
const screen:BlessedScreen = blessed.screen();
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
