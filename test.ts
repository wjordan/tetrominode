#!/usr/bin/env node

import Immutable = require('immutable');
import blessed = require('blessed');
import _ = require('lodash');
import {OneSidedPolyomino, PointInt, Polyomino} from './index';
import BlessedBox = Blessed.BlessedBox;
import Seq = Immutable.Seq;
import Iterable = Immutable.Iterable;

// Create a screen object.
var screen = blessed.screen();

function getCanvas(dimensions: PointInt): Immutable.OrderedMap<PointInt, BlessedBox> {
  return Immutable.OrderedMap<PointInt, BlessedBox>(dimensions.range().map(point => {
    var box = blessed.box({
      width: 2,
      height: 1,
      left: point.x * 2,
      top: point.y,
      bg: '#00ff00',
      fg: '#ff0000',
      content: ' .'
    });
    screen.append(box);
    return [point, box];
  }));
}

/*
var tetrominoes = OneSidedPolyomino.get(4);
tetrominoes.toIndexedSeq().forEach((tetromino, index) => {
  tetromino.points.forEach(point => {
    drawBox(point.add(new PointInt(index * 4, 0)));
  });
});
*/

// Draw the screen.
var canvas = getCanvas(new PointInt(10,20));

class Tetrion {

  /**Currently active Piece on the playfield*/
  public piece: Piece;
}

// A single piece, comprised of a polyomino in a fixed position/rotation.
class Piece {
  public shape:Polyomino;
  public position:PointInt;
  public canvas: Immutable.OrderedMap<PointInt, BlessedBox>;

  constructor(index: number, canvas) {
    this.shape = OneSidedPolyomino.get(4).toList().get(index);
    this.position = new PointInt(0, 0);
    this.canvas = canvas;
  }

  points() { return this.shape.points.map(point => point.add(this.position)); }
  transition(func) {
    this.draw(' .');
    func();
    this.draw('XX');
  }
  move(x: number, y: number) {
    this.transition(() => this.position = this.position.add(new PointInt(x, y)));
  }
  rotateRight() {
    this.transition(() => this.shape = this.shape.rotateRight());
  }

  draw(content) {
    this.points().forEach(point => {
      const box:BlessedBox = this.canvas.get(point);
      if(box) {
        box.content = content;
      }
    });
  }
}

var piece: Piece = new Piece(0, canvas);
piece.draw('XX');

screen.render();
screen.key(['q'], () => {
  console.log('exit!');
  process.exit(0);
});

screen.key(['space'], () => {
  piece.rotateRight();
  screen.render();
});

screen.key(['up'], () => {
  piece.move(0, -1);
  screen.render();
});

screen.key(['down'], () => {
  piece.move(0, 1);
  screen.render();
});

screen.key(['left'], () => {
  piece.move(-1, 0);
  screen.render();
});

screen.key(['right'], () => {
  piece.move(1, 0);
  screen.render();
});
