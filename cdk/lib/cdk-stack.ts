import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';

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

    const user = new iam.User(this, 'pzl-user', { userName: 'pzl-user' });
    bucket.grantReadWrite(user);
    const key = new iam.AccessKey(this, 'pzl-access-key', { user });
    new ssm.StringParameter(this, 'pzl-key', {
      parameterName: 'pzl-key',
      stringValue: key.accessKeyId,
    });
    new ssm.StringParameter(this, 'pzl-secret', {
      parameterName: 'pzl-secret',
      stringValue: key.secretAccessKey.unsafeUnwrap(),
    });
  }
}
