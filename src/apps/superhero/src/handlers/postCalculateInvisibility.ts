import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { RouteHandler, User } from '../types';
import axios from 'axios';
import { createResponse, generateCSV, logger } from '../../../../utils';
import { flatten } from 'flat';
import { S3 } from 'aws-sdk';

const s3 = new S3();

export const caclulateInvisibilityScore = (
  user: User,
  score: number,
): number => {
  const genderweighting = user.gender === 'male' ? 5 : 8;

  const maxPossibleScore = genderweighting * 100; //max superhero test score

  //calculate score
  const invisibilityScore = genderweighting * (score - user.dob.age);

  //normalise score to be between 1 and 100 based off max possible score
  return Math.max(0, (invisibilityScore / maxPossibleScore) * 100);
};

export const getInvisibilityStatus = (invisibilityScore: number): string => {
  const statusMap: { min: number; max: number; status: string }[] = [
    { min: 0, max: 20, status: 'Not invisible' },
    { min: 20, max: 40, status: 'Camouflage' },
    { min: 40, max: 60, status: 'Translucent' },
    { min: 60, max: 80, status: 'Transparent' },
    { min: 80, max: 100, status: 'Invisible' },
  ];

  const result = statusMap.find(
    ({ min, max }) => invisibilityScore >= min && invisibilityScore <= max,
  );

  return result ? result.status : 'Invalid score';
};

export const handler: RouteHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  logger.info('Received Event', { event });
  try {
    let user: User;

    // Get and validate payload.
    const { superheroScore } = JSON.parse(event.body || '{}');

    if (!superheroScore) {
      return createResponse(
        400,
        'Bad Request. superheroScore must be included in the payload.',
      );
    }

    if (
      typeof superheroScore !== 'number' ||
      superheroScore < 0 ||
      superheroScore > 100
    ) {
      return createResponse(
        400,
        'Bad Request. superheroScore must be a float between 0 and 100.',
      );
    }

    // get User details
    logger.info('Getting User...');
    try {
      const response = await axios.get('https://randomuser.me/api/');
      user = response.data.results[0];
    } catch (error: any) {
      return createResponse(500, 'Failed to fetch user.', {
        error: error.message,
      });
    }

    // calculate Invisibility Score
    logger.info('Calculating Invisibility Score...');
    const invisibilityScore = caclulateInvisibilityScore(user, superheroScore);

    // Get invisibility status
    logger.info('Getting Invisibility Status...');
    const invisibilityStatus = getInvisibilityStatus(invisibilityScore);

    // create final object (flattening user).
    const finalObject = {
      user: flatten(user),
      superheroScore,
      invisibilityScore,
      invisibilityStatus,
    };

    logger.info('Generating CSV File: ', finalObject);
    const responseCSV = generateCSV(finalObject);

    const bucketName = process.env.BUCKET_NAME!;
    const fileKey = `superhero-data-${Date.now()}.csv`;

    const params = {
      Bucket: bucketName,
      Key: fileKey,
      Body: responseCSV,
      ContentType: 'text/csv',
    };

    logger.info('Saving CSV File to S3 Bucket...');
    await s3.upload(params).promise();

    const fileUrl = `https://${bucketName}.s3.amazonaws.com/${fileKey}`;

    return createResponse(
      200,
      'Invisibility score calculated and data saved to CSV.',
      {
        userId: user.login.uuid,
        userAge: user.dob.age,
        superheroScore,
        invisibilityScore,
        invisibilityStatus,
        csvUrl: fileUrl,
      },
    );
  } catch (error: any) {
    return createResponse(500, 'An internal error occurred.', {
      error: error.message,
    });
  }
};

export default handler;
