#!/usr/bin/env node
import blessed = require('blessed');
import BlessedBox = Blessed.BlessedBox;
import {PointInt} from "./src/PointInt";
import {Cell} from "./src/Cell";
import {Playfield} from "./src/Playfield";

// Create a screen object.
var screen = blessed.screen();

function getCanvas(grid: Immutable.Map<PointInt, Cell>): Immutable.Map<PointInt, BlessedBox> {
  return grid.map((cell, point) => {
    var box = blessed.box({
      width: 2,
      height: 1,
      left: point.x * 2,
      top: point.y,
      bg: '#00ff00',
      fg: '#ff0000',
      content: cell.block.type
    });
    screen.append(box);
    return box;
  }).toMap();
}

const playfield: Playfield = new Playfield(getCanvas);


screen.render();
screen.key(['q'], () => {
  console.log('exit!');
  process.exit(0);
});

screen.key(['space'], () => {
  playfield.rotate();
  screen.render();
});

screen.key(['up'], () => {
  playfield.move(0, -1);
  screen.render();
});

screen.key(['d'], () => {
  playfield.move(0, 24);
  screen.render();
});

screen.key(['down'], () => {
  playfield.move(0, 1);
  screen.render();
});

screen.key(['left'], () => {
  playfield.move(-1, 0);
  screen.render();
});

screen.key(['right'], () => {
  playfield.move(1, 0);
  screen.render();
});
