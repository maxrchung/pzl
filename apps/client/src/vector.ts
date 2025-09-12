// Simple helper vector methods

import { Vector2d } from 'konva/lib/types';

export const getDistance = (v1: Vector2d, v2: Vector2d) => {
  const distance = Math.sqrt(
    Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2),
  );

  return distance;
};

export const getCenter = (v1: Vector2d, v2: Vector2d) => {
  const center = {
    x: (v1.x + v2.x) / 2,
    y: (v1.y + v2.y) / 2,
  };

  return center;
};
