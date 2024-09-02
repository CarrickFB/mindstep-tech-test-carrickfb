import 'dotenv/config';
import type { AWS } from '@serverless/typescript';

if (!process.env.SUPERHERO_API_KEY) {
  throw new Error('Missing SUPERHERO_API_KEY environment variable');
}

const superheroConfig: AWS = {
  service: 'superhero-service',

  provider: {
    name: 'aws',
    runtime: 'nodejs20.x',
    stage: 'dev',
    region: 'eu-west-1',
    logRetentionInDays: 7,
    apiGateway: {
      apiKeys: [
        { name: 'SuperheroApiKey', value: process.env.SUPERHERO_API_KEY },
      ], // Define API key
      usagePlan: {
        quota: {
          limit: 10,
          offset: 0,
          period: 'DAY',
        },
        throttle: {
          burstLimit: 5,
          rateLimit: 5,
        },
      },
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['s3:PutObject'],
        Resource: ['arn:aws:s3:::${self:custom.bucketName}/*'],
      },
    ],
    environment: {
      BUCKET_NAME: '${self:custom.bucketName}',
      LOG_LEVEL: 'debug',
    },
  },

  functions: {
    postCalculateInvisibility: {
      handler: 'src/handlers/postCalculateInvisibility.handler',
      events: [
        {
          http: {
            path: '/abilities/invisibility',
            method: 'post',
            private: true,
          },
        },
      ],
    },
  },

  resources: {
    Resources: {
      InvisibilityDataBucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: '${self:custom.bucketName}',
          LifecycleConfiguration: {
            Rules: [
              {
                Id: 'ClearBucketDaily',
                Status: 'Enabled',
                ExpirationInDays: 1,
              },
            ],
          },
          PublicAccessBlockConfiguration: {
            BlockPublicAcls: false,
            BlockPublicPolicy: false,
            IgnorePublicAcls: false,
            RestrictPublicBuckets: false,
          },
        },
        DeletionPolicy: 'Retain',
      },
      InvisibilityDataBucketPolicy: {
        Type: 'AWS::S3::BucketPolicy',
        Properties: {
          Bucket: { Ref: 'InvisibilityDataBucket' },
          PolicyDocument: {
            Statement: [
              {
                Effect: 'Allow',
                Principal: '*',
                Action: 's3:GetObject',
                Resource: ['arn:aws:s3:::${self:custom.bucketName}/*'],
              },
            ],
          },
        },
      },
    },
  },

  custom: {
    bucketName: 'superhero-csv-data-bucket-${self:provider.region}',
  },
};

export default superheroConfig;
