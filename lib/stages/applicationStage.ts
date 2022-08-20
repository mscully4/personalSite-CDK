import { Stage, StageProps, Environment } from "aws-cdk-lib";
import { Construct } from "constructs";
import { awsAccounts } from "../constants/accounts";
import { stageNames } from "../constants/stageNames";
import { ApiStack } from "../stacks/apiStack";
import { NetworkingStack } from "../stacks/networkingStack";
import { DistributionStack } from "../stacks/distributionStack";
import { StorageStack } from "../stacks/storageStack";
import { DeploymentEnvironment } from "../types/DeploymentEnvironment";
import { ShellStep } from "aws-cdk-lib/pipelines";

interface ApplicationStageProps extends StageProps {
  deploymentEnvironment: DeploymentEnvironment;
}

export class ApplicationStage extends Stage {
  constructor(scope: Construct, id: string, props: ApplicationStageProps) {
    super(scope, id, props);

    const env: Environment = {
      account: props.deploymentEnvironment.account,
      region: props.deploymentEnvironment.region,
    };

    const storageStack = new StorageStack(this, "storageStack", { env: env });

    const networkingStack = new NetworkingStack(this, "networkingStack", {
      env: env,
    });

    const apiStack = new ApiStack(this, "apiStack", {
      env: env,
      dynamoTableName: storageStack.dynamoTableName,
      dynamoTableReadRole: storageStack.dynamoTableReadRole,
      dynamoTableWriteRole: storageStack.dynamoTableWriteRole,
      sslCertificate: networkingStack.sslCertificate,
      hostedZone: networkingStack.hostedZone,
    });

    const personalSiteStack = new DistributionStack(this, "distributionStack", {
      env: env,
      hostedZone: networkingStack.hostedZone,
      sslCertificate: networkingStack.sslCertificate,
    });
    personalSiteStack.addDependency(networkingStack);
    personalSiteStack.addDependency(apiStack);
  }
}
