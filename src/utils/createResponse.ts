import { APIGatewayProxyResult } from 'aws-lambda';
import logger from './logger';

const createResponse = (
  statusCode: number,
  message: string,
  data?: Record<string, any> | null,
): APIGatewayProxyResult => {
  if (statusCode === 200) {
    logger.info('Response OK: ', {
      statusCode,
      body: JSON.stringify({
        message,
        ...(data !== null && data !== undefined ? data : {}),
      }),
    });
  } else {
    logger.error('Error: ', {
      statusCode,
      body: JSON.stringify({
        message,
        ...(data !== null && data !== undefined ? data : {}),
      }),
    });
  }
  return {
    statusCode,
    body: JSON.stringify({
      message,
      ...(data !== null && data !== undefined ? data : {}),
    }),
  };
};

export default createResponse;
