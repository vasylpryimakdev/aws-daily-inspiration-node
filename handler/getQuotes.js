import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION || process.env.REGION,
});

export const getQuotes = async (event) => {
  console.log("Incoming:", event);

  try {
    const { Body } = await s3.send(
      new GetObjectCommand({
        Bucket: "myjsonbucket-a23j1",
        Key: "quotes.json",
      }),
    );

    const json = JSON.parse(await Body.transformToString());

    console.log("JSON:", json);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
      },
      body: JSON.stringify(json),
    };
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Failed to retrieve quotes.",
        error: error.message,
      }),
    };
  }
};
