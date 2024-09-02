import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { handler as postCalculateInvisibilityHandler } from './handlers/postCalculateInvisibility';

interface RouteHandler {
  (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>;
}

const routeHandlers: Record<string, RouteHandler> = {
  'POST /abilities/invisibility': postCalculateInvisibilityHandler,
};

export const apiRouter = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const routeKey = `${event.httpMethod} ${event.resource}`;
  const handler = routeHandlers[routeKey];

  if (handler) {
    return handler(event);
  }

  return {
    statusCode: 404,
    body: JSON.stringify({
      message: 'Route not found',
    }),
  };
};
