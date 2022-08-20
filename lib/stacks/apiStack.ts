import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  RestApi,
  Resource,
  LambdaIntegration,
  DomainName,
  EndpointType,
} from "aws-cdk-lib/aws-apigateway";
import { Code, Runtime, LayerVersion, Function } from "aws-cdk-lib/aws-lambda";
import { Role } from "aws-cdk-lib/aws-iam";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import {
  ARecord,
  PublicHostedZone,
  RecordTarget,
} from "aws-cdk-lib/aws-route53";
import { ApiGatewayDomain } from "aws-cdk-lib/aws-route53-targets";
import { join, resolve } from "path";

const date = new Date();

interface apiStackProps extends StackProps {
  dynamoTableReadRole: Role;
  dynamoTableWriteRole: Role;
  dynamoTableName: string;
  sslCertificate: Certificate;
  hostedZone: PublicHostedZone;
}

export class ApiStack extends Stack {
  public restApi: RestApi;

  constructor(scope: Construct, id: string, props: apiStackProps) {
    super(scope, id, props);

    this.restApi = new RestApi(this, "personalSiteRestApi", {});

    const apiGatewayDomainName = new DomainName(this, "DomainName", {
      domainName: "api.michaeljscully.com",
      certificate: props.sslCertificate,
      endpointType: EndpointType.EDGE,
      mapping: this.restApi,
    });

    new ARecord(this, "ApiARecord", {
      zone: props.hostedZone,
      recordName: "api.michaeljscully.com",
      target: RecordTarget.fromAlias(
        new ApiGatewayDomain(apiGatewayDomainName)
      ),
    });

    const apiLayer = new LayerVersion(this, "apiLambdaLayer", {
      compatibleRuntimes: [Runtime.PYTHON_3_9, Runtime.PYTHON_3_8],
      code: Code.fromAsset("./api/python_dependencies"),
    });

    const apiCode = Code.fromAsset("./api/src/", {
      exclude: ["cdk.out", "node_modules"],
    });

    // Home Resource
    const homeApiResource = new Resource(this, "homeApiResource", {
      pathPart: "home",
      parent: this.restApi.root,
    });

    // Photos
    const homePhotosApiResource = new Resource(this, "homePhotosApiResource", {
      pathPart: "photos",
      parent: homeApiResource,
    });

    const homePhotosGetFunction = new Function(this, "homePhotosGetFunction", {
      runtime: Runtime.PYTHON_3_8,
      memorySize: 1024,
      timeout: Duration.seconds(30),
      handler: "api.home.photos.lambda_function.lambda_handler",
      code: apiCode,
      environment: {
        PYTHONPATH: "/var/runtime:/opt",
        DYNAMO_READ_ROLE_ARN: props.dynamoTableReadRole.roleArn,
        DYNAMO_TABLE_NAME: props.dynamoTableName,
        ACCESS_CONTROL_ALLOW_ORIGIN: "*",
        DATETIME: date.toISOString(),
      },
      layers: [apiLayer],
    });

    props.dynamoTableReadRole.grant(
      homePhotosGetFunction.role!,
      "sts:AssumeRole"
    );

    homePhotosApiResource.addMethod(
      "GET",
      new LambdaIntegration(homePhotosGetFunction),
      {}
    );

    // Resume Resource
    const resumeApiResource = new Resource(this, "resumeApiResource", {
      pathPart: "resume",
      parent: this.restApi.root,
    });

    // Experience
    const resumeJobsApiResource = new Resource(this, "resumeJobsApiResorce", {
      pathPart: "jobs",
      parent: resumeApiResource,
    });

    const resumeJobsGetFunction = new Function(this, "resumeJobsGetFunction", {
      runtime: Runtime.PYTHON_3_8,
      memorySize: 1024,
      timeout: Duration.seconds(30),
      handler: "api.resume.jobs.lambda_function.lambda_handler",
      code: apiCode,
      environment: {
        PYTHONPATH: "/var/runtime:/opt",
        DYNAMO_READ_ROLE_ARN: props.dynamoTableReadRole.roleArn,
        DYNAMO_TABLE_NAME: props.dynamoTableName,
        ACCESS_CONTROL_ALLOW_ORIGIN: "*",
        DATETIME: date.toISOString(),
      },
      layers: [apiLayer],
    });

    props.dynamoTableReadRole.grant(
      resumeJobsGetFunction.role!,
      "sts:AssumeRole"
    );

    resumeJobsApiResource.addMethod(
      "GET",
      new LambdaIntegration(resumeJobsGetFunction),
      {}
    );

    // Education
    const resumeEducationApiResource = new Resource(
      this,
      "resumeEducationApiResorce",
      {
        pathPart: "education",
        parent: resumeApiResource,
      }
    );

    const resumeEducationGetFunction = new Function(
      this,
      "resumeEducationGetFunction",
      {
        runtime: Runtime.PYTHON_3_8,
        memorySize: 1024,
        timeout: Duration.seconds(30),
        handler: "api.resume.education.lambda_function.lambda_handler",
        code: apiCode,
        environment: {
          PYTHONPATH: "/var/runtime:/opt",
          DYNAMO_READ_ROLE_ARN: props.dynamoTableReadRole.roleArn,
          DYNAMO_TABLE_NAME: props.dynamoTableName,
          ACCESS_CONTROL_ALLOW_ORIGIN: "*",
          DATETIME: date.toISOString(),
        },
        layers: [apiLayer],
      }
    );

    props.dynamoTableReadRole.grant(
      resumeEducationGetFunction.role!,
      "sts:AssumeRole"
    );

    resumeEducationApiResource.addMethod(
      "GET",
      new LambdaIntegration(resumeEducationGetFunction),
      {}
    );

    // Skills
    const resumeSkillsApiResource = new Resource(
      this,
      "resumeSkillsApiResorce",
      {
        pathPart: "skills",
        parent: resumeApiResource,
      }
    );

    const resumeSkillsGetFunction = new Function(
      this,
      "resumeSkillsGetFunction",
      {
        runtime: Runtime.PYTHON_3_8,
        memorySize: 1024,
        timeout: Duration.seconds(30),
        handler: "api.resume.skills.lambda_function.lambda_handler",
        code: apiCode,
        environment: {
          PYTHONPATH: "/var/runtime:/opt",
          DYNAMO_READ_ROLE_ARN: props.dynamoTableReadRole.roleArn,
          DYNAMO_TABLE_NAME: props.dynamoTableName,
          ACCESS_CONTROL_ALLOW_ORIGIN: "*",
          DATETIME: date.toISOString(),
        },
        layers: [apiLayer],
      }
    );

    props.dynamoTableReadRole.grant(
      resumeSkillsGetFunction.role!,
      "sts:AssumeRole"
    );

    resumeSkillsApiResource.addMethod(
      "GET",
      new LambdaIntegration(resumeSkillsGetFunction),
      {}
    );

    // Travel Resource
    const travelApiResource = new Resource(this, "travelApiResource", {
      pathPart: "travel",
      parent: this.restApi.root,
    });

    // Destinations
    const destinationsApiResource = new Resource(
      this,
      "destinationsApiResource",
      {
        pathPart: "destinations",
        parent: travelApiResource,
      }
    );

    const destinationsGetFunction = new Function(
      this,
      "destinationsGetFunction",
      {
        runtime: Runtime.PYTHON_3_8,
        memorySize: 1024,
        timeout: Duration.seconds(30),
        handler: "api.travel.destinations.lambda_function.lambda_handler",
        code: apiCode,
        environment: {
          PYTHONPATH: "/var/runtime:/opt",
          DYNAMO_READ_ROLE_ARN: props.dynamoTableReadRole.roleArn,
          DYNAMO_TABLE_NAME: props.dynamoTableName,
          ACCESS_CONTROL_ALLOW_ORIGIN: "*",
          DATETIME: date.toISOString(),
        },
        layers: [apiLayer],
      }
    );

    if (destinationsGetFunction.role) {
      props.dynamoTableReadRole.grant(
        destinationsGetFunction.role,
        "sts:AssumeRole"
      );
    }

    destinationsApiResource.addMethod(
      "GET",
      new LambdaIntegration(destinationsGetFunction),
      {}
    );

    // Places
    const placesApiResource = new Resource(this, "placesApiResource", {
      pathPart: "places",
      parent: travelApiResource,
    });

    const placesGetFunction = new Function(this, "placesGetFunction", {
      runtime: Runtime.PYTHON_3_8,
      memorySize: 1024,
      timeout: Duration.seconds(30),
      handler: "api.travel.places.lambda_function.lambda_handler",
      code: apiCode,
      environment: {
        PYTHONPATH: "/var/runtime:/opt",
        DYNAMO_READ_ROLE_ARN: props.dynamoTableReadRole.roleArn,
        DYNAMO_TABLE_NAME: props.dynamoTableName,
        ACCESS_CONTROL_ALLOW_ORIGIN: "*",
        DATETIME: date.toISOString(),
      },
      layers: [apiLayer],
    });

    if (placesGetFunction.role) {
      props.dynamoTableReadRole.grant(placesGetFunction.role, "sts:AssumeRole");
    }

    placesApiResource.addMethod(
      "GET",
      new LambdaIntegration(placesGetFunction),
      {}
    );

    // Photos
    const photosApiResource = new Resource(this, "photosApiResource", {
      pathPart: "photos",
      parent: travelApiResource,
    });

    const photosGetFunction = new Function(this, "photosGetFunction", {
      runtime: Runtime.PYTHON_3_8,
      memorySize: 1024,
      timeout: Duration.seconds(30),
      handler: "api.travel.photos.lambda_function.lambda_handler",
      code: apiCode,
      environment: {
        PYTHONPATH: "/var/runtime:/opt",
        DYNAMO_READ_ROLE_ARN: props.dynamoTableReadRole.roleArn,
        DYNAMO_TABLE_NAME: props.dynamoTableName,
        ACCESS_CONTROL_ALLOW_ORIGIN: "*",
        DATETIME: date.toISOString(),
      },
      layers: [apiLayer],
    });

    if (photosGetFunction.role) {
      props.dynamoTableReadRole.grant(photosGetFunction.role, "sts:AssumeRole");
    }

    photosApiResource.addMethod(
      "GET",
      new LambdaIntegration(photosGetFunction),
      {}
    );

    // Albums
    const albumsApiResource = new Resource(this, "albumsApiResource", {
      pathPart: "albums",
      parent: travelApiResource,
    });

    const albumsGetFunction = new Function(this, "albumsGetFunction", {
      runtime: Runtime.PYTHON_3_8,
      memorySize: 1024,
      timeout: Duration.seconds(30),
      handler: "api.travel.albums.lambda_function.lambda_handler",
      code: apiCode,
      environment: {
        PYTHONPATH: "/var/runtime:/opt",
        DYNAMO_READ_ROLE_ARN: props.dynamoTableReadRole.roleArn,
        DYNAMO_TABLE_NAME: props.dynamoTableName,
        ACCESS_CONTROL_ALLOW_ORIGIN: "*",
        DATETIME: date.toISOString(),
      },
      layers: [apiLayer],
    });

    props.dynamoTableReadRole.grant(albumsGetFunction.role!, "sts:AssumeRole");

    albumsApiResource.addMethod(
      "GET",
      new LambdaIntegration(albumsGetFunction),
      {}
    );
  }
}
