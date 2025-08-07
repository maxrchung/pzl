import { Vector2d, IRect } from 'konva/lib/types';
import { SNAP_BOUNDS_SQUARED } from './constants';

const distanceSquared = (a: Vector2d, b: Vector2d) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distance = dx * dx + dy * dy;
  return distance;
};

const snap = (a: Vector2d, b: Vector2d) => {
  const hasSnap = distanceSquared(a, b) < SNAP_BOUNDS_SQUARED;
  return hasSnap;
};

const snapLeftRight = (a: IRect, b: IRect) => {
  const left: Vector2d = {
    x: a.x + a.width,
    y: a.y + a.height / 2,
  };

  const right: Vector2d = {
    x: b.x,
    y: b.y + a.height / 2,
  };

  return snap(left, right);
};

const snapTopBottom = (a: IRect, b: IRect) => {
  const top: Vector2d = {
    x: a.x + a.width / 2,
    y: a.y + a.height,
  };

  const bottom: Vector2d = {
    x: b.x + b.width / 2,
    y: b.y,
  };

  return snap(top, bottom);
};

export const hasSnap = (
  a: IRect,
  aX: number,
  aY: number,
  b: IRect,
  bX: number,
  bY: number,
) => {
  if (aX < bX) {
    return snapLeftRight(a, b);
  } else if (aX > bX) {
    return snapLeftRight(b, a);
  } else if (aY < bY) {
    return snapTopBottom(a, b);
  } else if (aY > bY) {
    return snapTopBottom(b, a);
  }

  return false;
};
