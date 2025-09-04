import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'pzl-bucket', {
      bucketName: 'pzl-bucket',
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS_ONLY,
    });

    bucket.addCorsRule({
      allowedOrigins: ['http://localhost:4200', 'https://pzl.maxrchung.com'], // dev & prod
      allowedMethods: [s3.HttpMethods.POST],
      allowedHeaders: ['*'],
      maxAge: 3000,
    });
  }
}
