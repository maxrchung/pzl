export const S3_BUCKET = 'pzl-bucket';

export const S3_FOLDER =
  process.env.NODE_ENV === 'production' ? 'uploads' : 'dev';
