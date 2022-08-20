import { DeploymentEnvironment } from "../types/DeploymentEnvironment";
import { awsAccounts } from "./accounts";
import { stageNames } from "./stageNames";

export const deploymentEnvironments: Array<DeploymentEnvironment> = [
  {
    stage: stageNames.PROD,
    account: awsAccounts[stageNames.PROD],
    region: "us-west-2",
  },
];
