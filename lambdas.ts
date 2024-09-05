import type { CreateFunctionRequest } from "@aws-sdk/client-lambda";

export type LambdaConfig = Omit<CreateFunctionRequest, "Code"> & {
  Region: string;
};

const lambdas: LambdaConfig[] = [];

const awsAccount = process.env.AWS_ACCOUNT ?? "";

const roles = {
  start: "start-ec2-instances-role",
  stop: "stop-ec2-instances-role",
};

for (const [verb, role] of Object.entries(roles)) {
  lambdas.push({
    Region: "us-east-1",
    FunctionName: `${verb}-ec2-instances`,
    Role: `arn:aws:iam::1234567890:role/service-role/${role}`,
    Runtime: "nodejs18.x",
    Handler: "index.handler",
    Tags: {
      environment: "global",
      applicationRole: "infrastructure",
    },
  });
}

export default lambdas;
