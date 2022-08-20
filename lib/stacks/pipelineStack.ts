import {
  App,
  Environment,
  pipelines,
  Stack,
  StackProps,
  Stage,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { Pipeline, Artifact } from "aws-cdk-lib/aws-codepipeline";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { StageProps } from "aws-cdk-lib";
import {
  CodeBuildAction,
  GitHubSourceAction,
} from "aws-cdk-lib/aws-codepipeline-actions";
import {
  BuildSpec,
  LinuxBuildImage,
  PipelineProject,
} from "aws-cdk-lib/aws-codebuild";
import {
  ArtifactMap,
  CodeBuildStep,
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "aws-cdk-lib/pipelines";
import { StorageStack } from "./storageStack";
import { awsAccounts } from "../constants/accounts";
import { stageNames } from "../constants/stageNames";
import { ApiStack } from "./apiStack";
import { DeploymentEnvironment } from "../types/DeploymentEnvironment";
import { ApplicationStage } from "../stages/applicationStage";

interface PipelineStackProps extends StackProps {
  appName: string;
  deploymentEnvironments: Array<DeploymentEnvironment>;
}

export class PipelineStack extends Stack {
  pipeline: CodePipeline;
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    // Need to manually update the secret plaintext with Github API Key
    const githubAccessToken = new Secret(this, "githubAccessTokenSecret");

    const frontEndBuildStep = new ShellStep("Build Frontend", {
      // Where the source can be found
      input: CodePipelineSource.gitHub(
        "mscully4/personalSite-Frontend",
        "master-v2",
        {
          authentication: githubAccessToken.secretValue,
        }
      ),
      commands: ["npm ci", "npm run build"],
    });

    const backEndBuildStep = new ShellStep("Build Backend", {
      // Where the source can be found
      input: CodePipelineSource.gitHub(
        "mscully4/personalSite-Backend",
        "master-v2",
        {
          authentication: githubAccessToken.secretValue,
        }
      ),
      commands: [
        "python3 -m pip install -r ./requirements.txt --target python_dependencies",
      ],
    });

    this.pipeline = new CodePipeline(this, "PersonalSitePipeline", {
      // How it will be built and synthesized
      crossAccountKeys: false,
      selfMutation: true,

      synth: new ShellStep("Synth", {
        // Where the source can be found
        input: CodePipelineSource.gitHub(
          "mscully4/personalSite-CDK",
          "master",
          {
            authentication: githubAccessToken.secretValue,
          }
        ),
        additionalInputs: {
          api: backEndBuildStep.addOutputDirectory("./"),
          frontend: frontEndBuildStep.addOutputDirectory("./build"),
        },
        // Install dependencies, build and run cdk synth
        commands: ["ls", "npm ci", "npm run build", "npx cdk synth --quiet"],
      }),
    });

    props.deploymentEnvironments.map((env) => {
      const appStage = new ApplicationStage(
        this,
        `${props.appName}-${env.stage}`,
        {
          deploymentEnvironment: env,
        }
      );

      this.pipeline.addStage(appStage, {});
    });
  }
}
