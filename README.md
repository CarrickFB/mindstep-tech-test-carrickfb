## Mindstep Tech Test - Superhero Scores!

## Description

The purpose of this test was to build a serverless microservice that could calculate the invisibility score of a user and normalise it
before saving all relevant data to a CSV File. The user is acquired as part of the function using a publicly accessible endpoint, and their data is saved to the final file.

In my implementation, the CSV file is uploaded to an S3 bucket and the publicly accessible link will be returned as part of the response.

## General notes

- On my deployed example (see below) there is a rate limit and maximum number of 10 uses per day via the provided API key, this is because the endpoint is public I'd like to keep the api safe from potential malpractice. The API key will be provided in the email I send you along with the git repo.

- The normalisation of the score is based off the maximum possible score a user could achieve (genderWeighting \* 100), 100 being the maximum value that can be passed as a superheroScore. This means the final score is representative of being somewhere within the overall range of possible scores.

- The CSV file is publicly accessible, however it will only be available for 24hrs since the S3 bucket is set to clear on a daily basis.

## Setup

This project has been built using yarn, Typescript and Serverless Framework with Jest, eslint and prettier for formatting and coverage.

- Serverless Framework - https://www.serverless.com/framework/docs

## Installing/Deploying

1. Install packages by heading to the root directory and running `yarn install`
2. Navigate to the superhero microservice directory at `src/apps/superhero`
3. You will need to add a .env file with `SUPERHERO_API_KEY` and provide an api key of your choice that will be a basic form of authorization since the endpoint is otherwise public. this .env file must be placed in the root of the superhero directory, not the project, since the service sits independently (`src/apps/superhero/`)
4. If your serverless cli is linked to your AWS account, you can run `serverless deploy` to deploy the superhero app.

NOTE: You may need to change the bucket name on line 83 of serverless.ts if it fails to deploy since the unique identifier is only via region and could
overlap with my existing bucket.

## Tests

Tests can be run using `yarn test` and cover all logical functions, including the primary microservice and any utility functions.

## The endpoint itself.

My implementation is currently deployed and can be accessed at `https://fxbmlmu5y3.execute-api.eu-west-1.amazonaws.com/dev/abilities/invisibility`

The API key has been provided via email.

1. Create a POST request to the URL with the provided api key (I will send you this in the email linking to this project) using `x-api-key` header
2. The response will return the `uuid` of the user (retrieved from https://randomuser.me/api/ as part of the function), `userAge`, `superheroScore`, `invisibilityScore`, `invisibilityStatus` and `csvUrl`; a link to the CSV file containing all the data.

Example Response: `{
    "message": "Invisibility score calculated and data saved to CSV.",
    "userId": "f7d4f346-6597-4b8e-b3ed-db27024ef0a5",
    "userAge": 70,
    "superheroScore": 60,
    "invisibilityScore": 0,
    "invisibilityStatus": "Not invisible",
    "csvUrl": "https://superhero-csv-data-bucket-eu-west-1.s3.amazonaws.com/superhero-data-1725309669409.csv"
}`
