/**
 * Different gameplay modes (difficulty curves, scoring, win/loss conditions, etc)
 */
export interface PlayMode {
  // Gravity expressed in number of rows descended per frame (TGM works in fractions of 256 so we'll follow that convention)
  gravity: number;

  // Lock Delay is the max amount of frames a piece rests on ground level before locking
  maxLockDelay: number;

  // Are is the normal 'eh?' pause in between a piece lock and the next piece spawn
  are: number;

  // Line Clear Delay is length of the pause after lines are cleared
  lineClearDelay: number;

  // Whatever 'Score' means in this mode
  score: number;

  // Logic to perform each frame
  update();

  // Logic to perform after a line clear
  lineClear(numLines: number);

  // Logic to perform after a piece is locked
  pieceLock();
}

// TGM-style level advancement.
class TgmLevelAdvance {
  // Segment difficulty by 100-level chunks
  seg = 100;
  level = 0;

  lineClear(numLines: number) {
    this.level += numLines;
    if (this.level % this.seg < numLines) {
      this.level -= this.level % this.seg;
    }
  }

  pieceLock() {
    if (this.level % this.seg < this.seg - 1) {
      this.level += 1;
    }
  }
}

/**Standard easy-mode. Start off ridiculously slow, then ramp up difficulty curve based on
 * number of lines cleared.
 */
export class EasyMode extends TgmLevelAdvance implements PlayMode {
  public maxLockDelay = 30;
  public are = 25;
  public lineClearDelay = 40;
  public gravity = (4.0 / 256);

  score = 0;

  // Gravity curve as specified on TetrisConcept wiki
  gravityCurve = [
    [0, 4],
    [8, 5],
    [19, 6],
    [35, 8],
    [40, 10],
    [50, 12],
    [60, 16],
    [70, 32],
    [80, 48],
    [90, 64],
    [100, 4],
    [108, 5],
    [119, 6],
    [125, 8],
    [131, 12],
    [139, 32],
    [149, 48],
    [156, 80],
    [164, 112],
    [174, 128],
    [180, 144],
    [200, 16],
    [212, 48],
    [221, 80],
    [232, 112],
    [244, 144],
    [256, 176],
    [267, 192],
    [277, 208],
    [287, 224],
    [295, 240],
    [300, 5120]
  ];
  currentGravity = 0;

  _gravity(): number {
    if (
      this.currentGravity + 1 < this.gravityCurve.length &&
      this.gravityCurve[this.currentGravity + 1][0] <= this.level
    ) {
      this.currentGravity += 1;
    }
    return (this.gravityCurve[this.currentGravity][1] / 256.0 * 4);
  }

  update() {
    this.score = this.level;
    this.gravity = this._gravity();
  }

  lineClear(numLines: number) {
    super.lineClear(numLines);
    if (this.level === 3000) {
      console.log("Congratulations! You win!");
    }
  }
}

/**"TA Death" mode. Starts immediately at 20G and adjusts the timings as
 *  levels advance.
 */
export class TADeath extends TgmLevelAdvance {
  /* Curve as specified on TetrisConcept wiki */
  public curvePoints = [0, 100, 200, 300, 400, 500];
  public areCurve = [18, 14, 14, 8, 7, 6];
  public areLineCurve = [12, 6, 6, 6, 5, 4];
  public dasCurve = [12, 12, 11, 10, 8, 8];
  public lockCurve = [30, 26, 22, 18, 15, 15];
  public lineClearCurve = [12, 6, 6, 6, 5, 4];

  public curve = 0;

  public score = 0;
  public are = this.areCurve[0];
  public lineClearDelay = this.lineClearCurve[0];
  public maxLockDelay = this.lockCurve[0];
  public gravity = 20.0;

  public lineClear(numLines: number) {
    super.lineClear(numLines);

    if (this.curve + 1 < this.curvePoints.length && this.curvePoints[this.curve + 1] <= this.level) {
      this.curve += 1;
      this.are = this.areCurve[this.curve];
      this.lineClearDelay = this.lineClearCurve[this.curve];
      this.maxLockDelay = this.lockCurve[this.curve];
      console.log("Upgrading level!!");
      console.log("new are=" + this.are);
    }
  }

  update() {
    this.score = this.level;
  }
}
