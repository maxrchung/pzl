export const SERVER_CORS = {
  origin:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:4200'
      : 'https://pzl.maxrchung.com',
};

export const SERVER_PORT = 3000;

export const SERVER_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://pzl.up.run.app'
    : `http://localhost:${SERVER_PORT}`;

export const S3_BUCKET = 'pzl-bucket';

export const S3_FOLDER =
  process.env.NODE_ENV === 'production' ? 'uploads' : 'dev';

export const DEFAULT_IMAGE_KEY = 'static/default.jpg';

export const DEFAULT_IMAGE_URL =
  'https://pzl-bucket.s3.us-west-1.amazonaws.com/static/default.jpg';

// Need to manually update this :O
export const DEFAULT_IMAGE_SIZE = {
  height: 240,
  width: 240,
};

/** Length of the default stage that server maintains */
export const STAGE_LENGTH = 1000;

export const DEFAULT_SIDES = 5;
