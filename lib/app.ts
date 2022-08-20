#!/usr/bin/env node
import { App, Environment, Stage } from "aws-cdk-lib";
import { awsAccounts } from "./constants/accounts";
import { deploymentEnvironments } from "./constants/deploymentEnvironments";
import { stageNames } from "./constants/stageNames";
import { PipelineStack } from "./stacks/pipelineStack";
import { ApplicationStage } from "./stages/applicationStage";

const appName = "michaeljscullydotcom";
const app = new App();

const pipelineDeploymentEnvironment: Environment = {
  account: awsAccounts[stageNames.PROD],
  region: "us-west-2",
};

const pipelineStack = new PipelineStack(app, `${appName}-pipelineStack`, {
  env: pipelineDeploymentEnvironment,
  appName: appName,
  deploymentEnvironments: deploymentEnvironments,
});

app.synth();
