#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CiCdAwsPipelineDemoStack } from "../lib/ci-cd-aws-pipeline-demo-stack";

const app = new cdk.App();
new CiCdAwsPipelineDemoStack(app, "CiCdAwsPipelineDemoStack", {
  env: {
    account: "735029168602",
    region: "us-west-2",
  },
});

app.synth();
