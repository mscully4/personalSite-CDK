import { DeploymentEnvironment } from "../types/DeploymentEnvironment";
import { awsAccounts } from "./accounts";
import { stages } from "./stages";

export const deploymentEnvironments: Array<DeploymentEnvironment> = [
  {
    stage: stages.PROD,
    account: awsAccounts[stages.PROD],
    region: "us-west-2"
  }
]