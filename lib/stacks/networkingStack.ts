import { Stack, StackProps } from "aws-cdk-lib";
import {
  Certificate,
  DnsValidatedCertificate,
} from "aws-cdk-lib/aws-certificatemanager";
import { PublicHostedZone } from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";

interface networkingStackProps extends StackProps {}

export class NetworkingStack extends Stack {
  public sslCertificate: Certificate;
  public hostedZone: PublicHostedZone;
  constructor(scope: Construct, id: string, props: networkingStackProps) {
    super(scope, id, props);

    this.hostedZone = new PublicHostedZone(this, "HostedZone", {
      zoneName: "michaeljscully.com",
    });

    this.sslCertificate = new DnsValidatedCertificate(this, "SSLCertificate", {
      domainName: "michaeljscully.com",
      hostedZone: this.hostedZone,
      region: "us-east-1",
      subjectAlternativeNames: ["*.michaeljscully.com"],
    });
  }
}
