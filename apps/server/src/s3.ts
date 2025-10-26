import {
  S3Client,
  HeadObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { S3_FOLDER, S3_BUCKET } from '@pzl/shared';
import { nanoid } from 'nanoid';

const s3 = new S3Client();

const createKey = async (): Promise<string> => {
  const key = `${S3_FOLDER}/${nanoid()}`;
  const head = new HeadObjectCommand({ Bucket: S3_BUCKET, Key: key });

  try {
    await s3.send(head);
    console.log('Collision lol');

    return createKey();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return key;
  }
};

export const createPresign = async (contentType: string) => {
  const key = await createKey();

  const presign = await createPresignedPost(s3, {
    Bucket: S3_BUCKET,
    Key: key,
    Fields: {
      'Content-Type': contentType,
    },
    Conditions: [
      ['content-length-range', 0, 10 * 1024 * 1024], // max 10 MB
    ],
    Expires: 60, // 1 minute
  });

  return presign;
};

export const deleteUpload = async (key: string) => {
  const deleteObject = new DeleteObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });

  await s3.send(deleteObject);
};

export const deleteAllUploads = async () => {
  const list = new ListObjectsV2Command({
    Bucket: S3_BUCKET,
    Prefix: `${S3_FOLDER}/`,
  });

  const uploads = await s3.send(list);

  if (!uploads.Contents || uploads.Contents.length === 0) {
    return;
  }

  const deleteObjects = new DeleteObjectsCommand({
    Bucket: S3_BUCKET,
    Delete: {
      Objects: uploads.Contents.map((upload) => ({ Key: upload.Key })),
    },
  });
  s3.send(deleteObjects);
};

export const getImageUrl = (key: string) => {
  const imageUrl = `https://${S3_BUCKET}.s3.us-west-1.amazonaws.com/${key}`;

  return imageUrl;
};
