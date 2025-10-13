import { SERVER_PORT } from '@pzl/shared';

export const THROTTLE_DELAY_IN_MS = 50; // About 30 FPS

export const SECRET_INTERVAL_IN_MS = 1000;

export const SNAP_BOUNDS_SQUARED = 100;

export const SCALE_TICK = 1.1;
export const SCALE_MIN = 0.01;
export const SCALE_MAX = 10;

export const SERVER_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://pzl.up.railway.app'
    : `http://${window.location.hostname}:${SERVER_PORT}`;

export const NOTIFICATION_FADE_IN_MS = 150;
export const NOTIFICATION_ACTIVE_IN_MS = 2000;

export const Z_INDEX = {
  STAGE: 'z-0',
  DROPDOWN: 'z-10',
  NAVBAR: 'z-20',
  TOOLTIP: 'z-30',
  MODAL: 'z-40',
  NOTIFICATION: 'z-50',
};
