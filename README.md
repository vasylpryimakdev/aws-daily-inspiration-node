# AWS Daily Inspiration Node

A Serverless AWS project that delivers daily inspirational quotes and manages subscriber email workflows.

## Project overview

This repository includes:

- AWS Lambda functions defined with the Serverless Framework in `serverless.yml`
- AWS resources: DynamoDB table (`UsersTable`) and SNS topic for message routing
- Quote retrieval from an S3 bucket (`myjsonbucket-a23j1/quotes.json`)
- Subscriber registration using a DynamoDB-backed API
- Email sending via SendGrid from the `sendEmail` function
- A Next.js client app in `client/`

## Architecture

- `handler/getQuotes.js` - returns quote JSON from S3
- `handler/subscribeUser.js` - adds a subscriber record to DynamoDB
- `handler/getSubscribers.js` - lists subscribers from DynamoDB
- `handler/staticMailer.js` - publishes a message to SNS and optionally subscribes a user
- `handler/sendEmail.js` - fetches a quote and subscriber emails, then sends a daily email through SendGrid

> Note: `handler.js` at the repository root is a separate Express-based example and is not wired into the current Serverless function definitions.

## Prerequisites

- Node.js 18+ installed
- npm installed
- Serverless Framework CLI installed globally (`npm install -g serverless`)
- AWS credentials configured locally for deployment
- SendGrid API key and verified sender email

## Setup

1. Install root dependencies:

```bash
npm install
```

2. Install client dependencies:

```bash
cd client
npm install
cd ..
```

## Environment variables

The Serverless service uses environment variables for runtime configuration. Important values include:

- `SENDGRID_API_KEY` - SendGrid API key for `sendEmail`
- `SENDER_EMAIL` - verified sender address used by SendGrid
- `USERS_TABLE` - DynamoDB table name
- `REGION` - AWS region
- `API_URL` - deployed API base URL used by `sendEmail` and other functions
- `SNS_TOPIC_ARN` - SNS topic ARN for `staticMailer`

The current `serverless.yml` already sets these values for deployment, but you should avoid committing secrets in source control.

## Deployment

Deploy the service with:

```bash
serverless deploy
```

To remove the deployed stack:

```bash
serverless remove
```

## Local development

For local Serverless development, use:

```bash
serverless dev
```

This starts a local Lambda emulator and forwards HTTP requests to your functions.

## API endpoints

The service exposes the following HTTP endpoints:

- `GET /quotes` - returns quotes from the configured S3 bucket
- `POST /subscribe` - registers a new subscriber email in DynamoDB
- `POST /static-mailer` - publishes a message to SNS and attempts to subscribe a user
- `POST /sendEmail` - sends the daily quote email to subscribers (also invoked on a schedule)
- `GET /getSubscribers` - returns all subscriber records from DynamoDB

### Example: subscribe a user

```bash
curl -X POST https://<api-url>/subscribe \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com"}'
```

### Example: get quotes

```bash
curl https://<api-url>/quotes
```

## Client app

The `client/` directory contains a Next.js application with its own `package.json`.

To run the client locally:

```bash
cd client
npm run dev
```

## Notes

- `handler/sendEmail.js` uses `axios` to call the deployed API, so `API_URL` must point to the correct stage URL.
- `handler/getQuotes.js` reads quotes from S3 and expects the file path `quotes.json` in bucket `myjsonbucket-a23j1`.
- `staticMailer` currently posts to a hard-coded URL in `handler/staticMailer.js`; this should be updated if the deployed API URL changes.

## Cleanup

After testing, remove the stack to avoid AWS charges:

```bash
serverless remove
```
