export const SERVER_CORS = {
  origin:
    process.env.NODE_ENV === 'production' ? 'https://pzl.maxrchung.com' : '*',
};

export const SERVER_PORT = 3000;

export const S3_BUCKET = 'pzl-bucket';

export const S3_FOLDER =
  process.env.NODE_ENV === 'production' ? 'uploads' : 'dev';

export const DEFAULT_IMAGE_KEY = 'static/default.jpg';

export const DEFAULT_IMAGE_URL = `https://${S3_BUCKET}.s3.us-west-1.amazonaws.com/${DEFAULT_IMAGE_KEY}`;

// Need to manually update this :O
export const DEFAULT_IMAGE_SIZE = {
  height: 240,
  width: 240,
};

// TODO: Temp 0 as we refactor piece clip group
export const STROKE_WIDTH = 0;

/** Length of the default stage that server maintains */
export const STAGE_LENGTH = 1000;

export const DEFAULT_SIDES = { columns: 5, rows: 5 };
