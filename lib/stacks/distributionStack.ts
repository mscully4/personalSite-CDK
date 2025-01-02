import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import {
  Distribution,
  OriginAccessIdentity,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import {
  AaaaRecord,
  ARecord,
  PublicHostedZone,
  RecordTarget,
} from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

interface distributionStackProps extends StackProps {
  readonly hostedZone: PublicHostedZone;
  readonly sslCertificate: Certificate;
}

export class DistributionStack extends Stack {
  constructor(scope: Construct, id: string, props: distributionStackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, "staticSiteBucket", {
      publicReadAccess: true,
            blockPublicAccess: new BlockPublicAccess({
              blockPublicAcls: false,
              ignorePublicAcls: false,
              blockPublicPolicy: false,
              restrictPublicBuckets: false,
            }),    
      removalPolicy: RemovalPolicy.DESTROY,
      websiteIndexDocument: "index.html",
    });

    const originAccessIdentity = new OriginAccessIdentity(
      this,
      "OriginAccessIdentity"
    );
    bucket.grantRead(originAccessIdentity);

    const distribution = new Distribution(this, "personalSiteDistribution", {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: new S3Origin(bucket, { originAccessIdentity }),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
      ],
      certificate: props.sslCertificate,
      domainNames: ["michaeljscully.com"],
    });

    new BucketDeployment(this, "staticSiteDeployment", {
      destinationBucket: bucket,
      sources: [Source.asset("./frontend")],
      distribution: distribution,
      distributionPaths: ["/*"],
    });

    new ARecord(this, "ARecord", {
      zone: props.hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });

    new AaaaRecord(this, "AAAARecord", {
      zone: props.hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });
  }
}
