const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("node:crypto");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || process.env.REGION,
});

const dynamoDb = DynamoDBDocumentClient.from(client);

const USERS_TABLE = process.env.USERS_TABLE;

module.exports.subscribeUser = async (event) => {
  try {
    const data = JSON.parse(event.body);

    console.log("EVENT:", data);

    if (!data.email || typeof data.email !== "string") {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "Validation failed. Email is required.",
        }),
      };
    }

    const timestamp = Date.now();

    const item = {
      userId: randomUUID(),
      email: data.email,
      subscriber: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await dynamoDb.send(
      new PutCommand({
        TableName: USERS_TABLE,
        Item: item,
      }),
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(item),
    };
  } catch (error) {
    console.error("Subscribe user error:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Failed to subscribe user.",
        error: error.message,
      }),
    };
  }
};
