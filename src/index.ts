import {
  EC2Client,
  StartInstancesCommand,
  StopInstancesCommand,
} from "@aws-sdk/client-ec2";
import type { InstanceStateChange } from "@aws-sdk/client-ec2";
import type { APIGatewayProxyResult, Context } from "aws-lambda";

const { EC2_INSTANCE_IDS } = process.env;
const instanceIds = EC2_INSTANCE_IDS?.split(", ") ?? [];
const ec2 = new EC2Client({});

export async function handler(
  _event: {},
  context: Context
): Promise<APIGatewayProxyResult> {
  const verb = context.functionName.split("-")[1];
  let instanceStates: InstanceStateChange[] | undefined;
  switch (verb) {
    case "start":
      const { StartingInstances } = await ec2.send(
        new StartInstancesCommand({ InstanceIds: instanceIds })
      );
      instanceStates = StartingInstances;
      break;
    case "stop":
      const { StoppingInstances } = await ec2.send(
        new StopInstancesCommand({ InstanceIds: instanceIds })
      );
      instanceStates = StoppingInstances;
      break;
  }
  const responseEntries = instanceStates?.map(
    ({ CurrentState, InstanceId, PreviousState }) =>
      [
        InstanceId,
        {
          CurrentState: CurrentState?.Name,
          PreviousState: PreviousState?.Name,
        },
      ] as const
  );
  const response = {
    statusCode: "Ok",
    body: JSON.stringify(Object.fromEntries(responseEntries ?? [])),
  };
  return response;
}
