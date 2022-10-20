import { Table, AttributeType, BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AccountRootPrincipal, Role } from "aws-cdk-lib/aws-iam";
import { Bucket } from "aws-cdk-lib/aws-s3";

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

    const travelPhotosBucket = new Bucket(this, "travelMapPhotosBucket", {});
    travelPhotosBucket.grantPublicAccess();

    const homePhotosBucket = new Bucket(this, "homePhotosBucket", {});
    homePhotosBucket.grantPublicAccess();

    const staticResourcesBucket = new Bucket(this, "staticResourcesBucket", {});
    staticResourcesBucket.grantPublicAccess();
  }
}
