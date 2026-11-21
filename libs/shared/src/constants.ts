export const SERVER_CORS = {
  origin:
    process.env.NODE_ENV === 'production' ? 'https://pzl.max.rodeo' : '*',
};

export const SERVER_PORT = 3000;

export const S3_FOLDER =
  process.env.NODE_ENV === 'production' ? 'uploads' : 'dev';

export const DEFAULT_IMAGE_URL = '/default.jpg';
// Need to manually update this :O
export const DEFAULT_IMAGE_SIZE = { height: 240, width: 240 };

/** Length of the default stage that server maintains */
export const STAGE_LENGTH = 1000;

export const DEFAULT_SIDES = { columns: 5, rows: 5 };
