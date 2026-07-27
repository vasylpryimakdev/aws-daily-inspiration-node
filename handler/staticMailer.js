import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const sns = new SNSClient({
  region: process.env.AWS_REGION || process.env.REGION,
});

const buildEmailBody = (identity, form) => `
Message: ${form.message}
Name: ${form.name}
Email: ${form.email}
Service information: ${identity.sourceIp} - ${identity.userAgent}
`;

export const staticMailer = async (event) => {
  try {
    console.log("EVENT:", event);

    const data = JSON.parse(event.body);

    const emailBody = buildEmailBody(event.requestContext.identity, data);

    await sns.send(
      new PublishCommand({
        TopicArn: process.env.SNS_TOPIC_ARN,
        Message: emailBody,
      }),
    );

    try {
      const response = await fetch(
        "https://4g9pgma4m7.execute-api.us-east-1.amazonaws.com/dev/subscribe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: data.email,
          }),
        },
      );

      console.log("Subscribe status:", response.status);
    } catch (error) {
      console.error("Error subscribing user:", error);
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": false,
      },
      body: JSON.stringify({
        message: "OK",
      }),
    };
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Failed to process request.",
        error: error.message,
      }),
    };
  }
};
