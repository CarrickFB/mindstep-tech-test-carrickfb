import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { apiRouter } from '../handler';
import { handler as postCalculateInvisibilityHandler } from '../handlers/postCalculateInvisibility';

jest.mock('../handlers/postCalculateInvisibility');

const mockedPostCalculateInvisibilityHandler =
  postCalculateInvisibilityHandler as jest.MockedFunction<
    typeof postCalculateInvisibilityHandler
  >;

describe('apiRouter', () => {
  it('should route to postCalculateInvisibility when the route is POST /abilities/invisibility', async () => {
    mockedPostCalculateInvisibilityHandler.mockResolvedValue({
      statusCode: 200,
      body: JSON.stringify({ message: 'Success' }),
    });

    const event: APIGatewayProxyEvent = {
      httpMethod: 'POST',
      resource: '/abilities/invisibility',
      body: JSON.stringify({ superheroScore: 50 }),
    } as any;

    const result: APIGatewayProxyResult = await apiRouter(event);

    expect(result.statusCode).toBe(200);
    expect(result.body).toContain('Success');
    expect(mockedPostCalculateInvisibilityHandler).toHaveBeenCalledTimes(1);
    expect(mockedPostCalculateInvisibilityHandler).toHaveBeenCalledWith(event);
  });

  it('should return 404 if the route is not found', async () => {
    const event: APIGatewayProxyEvent = {
      httpMethod: 'GET',
      resource: '/non-existent-route',
    } as any;

    const result: APIGatewayProxyResult = await apiRouter(event);

    expect(result.statusCode).toBe(404);
    expect(result.body).toContain('Route not found');
  });

  it('should return 404 if the method is not supported for the existing route', async () => {
    const event: APIGatewayProxyEvent = {
      httpMethod: 'GET',
      resource: '/abilities/invisibility',
    } as any;

    const result: APIGatewayProxyResult = await apiRouter(event);

    expect(result.statusCode).toBe(404);
    expect(result.body).toContain('Route not found');
  });
});
