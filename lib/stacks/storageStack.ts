import { Table, AttributeType, BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AccountRootPrincipal, Role } from "aws-cdk-lib/aws-iam";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";

export class StorageStack extends Stack {
  public dynamoTableReadRole: Role;
  public dynamoTableWriteRole: Role;
  public dynamoTableName: string;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const dynamoTable = new Table(this, `personalSiteTable`, {
      partitionKey: { name: "PK", type: AttributeType.STRING },
      sortKey: { name: "SK", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
    });

    this.dynamoTableName = dynamoTable.tableName;

    this.dynamoTableReadRole = new Role(this, "tableReadRole", {
      assumedBy: new AccountRootPrincipal(),
    });

    this.dynamoTableWriteRole = new Role(this, "tableWriteRole", {
      assumedBy: new AccountRootPrincipal(),
    });

    dynamoTable.grantReadData(this.dynamoTableReadRole);
    dynamoTable.grantWriteData(this.dynamoTableWriteRole);

    const travelPhotosBucket = new Bucket(this, "travelMapPhotosBucket", {
      publicReadAccess: true,
      blockPublicAccess: new BlockPublicAccess({
        blockPublicAcls: false,
        ignorePublicAcls: false,
        blockPublicPolicy: false,
        restrictPublicBuckets: false,
      }),    
    });
    travelPhotosBucket.grantPublicAccess();

    const homePhotosBucket = new Bucket(this, "homePhotosBucket", {
      publicReadAccess: true,
      blockPublicAccess: new BlockPublicAccess({
        blockPublicAcls: false,
        ignorePublicAcls: false,
        blockPublicPolicy: false,
        restrictPublicBuckets: false,
      }),   
    });
    homePhotosBucket.grantPublicAccess();

    const staticResourcesBucket = new Bucket(this, "staticResourcesBucket", {
      publicReadAccess: true,
      blockPublicAccess: new BlockPublicAccess({
        blockPublicAcls: false,
        ignorePublicAcls: false,
        blockPublicPolicy: false,
        restrictPublicBuckets: false,
      }),
    });
    staticResourcesBucket.grantPublicAccess();
  }
}
