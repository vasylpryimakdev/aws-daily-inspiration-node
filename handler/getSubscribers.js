import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);

const USERS_TABLE = process.env.USERS_TABLE;

export const getSubscribers = async () => {
  try {
    const { Items } = await dynamoDb.send(
      new ScanCommand({
        TableName: USERS_TABLE,
      }),
    );

    return {
      statusCode: 200,
      body: JSON.stringify(Items),
    };
  } catch (error) {
    console.error("Get subscribers error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to get subscribers",
        error: error.message,
      }),
    };
  }
};
