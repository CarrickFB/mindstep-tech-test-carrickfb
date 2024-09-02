import { APIGatewayProxyResult } from 'aws-lambda';
import { createResponse } from '../../../../../utils';

describe('createResponse', () => {
  it('should create a response with a status code and message', () => {
    const statusCode = 200;
    const message = 'Success';

    const result: APIGatewayProxyResult = createResponse(statusCode, message);

    expect(result.statusCode).toBe(statusCode);
    expect(result.body).toBe(JSON.stringify({ message }));
  });

  it('should include additional data in the response body', () => {
    const statusCode = 200;
    const message = 'Data fetched successfully';
    const data = {
      user: { name: 'John Doe', email: 'john.doe@example.com' },
      superheroScore: 85,
    };

    const result: APIGatewayProxyResult = createResponse(
      statusCode,
      message,
      data,
    );

    expect(result.statusCode).toBe(statusCode);
    expect(result.body).toBe(JSON.stringify({ message, ...data }));
  });

  it('should return an empty object if no data is provided', () => {
    const statusCode = 404;
    const message = 'Not Found';

    const result: APIGatewayProxyResult = createResponse(statusCode, message);

    expect(result.statusCode).toBe(statusCode);
    expect(result.body).toBe(JSON.stringify({ message }));
  });

  it('should handle null and undefined data correctly', () => {
    const statusCode = 500;
    const message = 'Internal Server Error';
    const data = null;

    const result: APIGatewayProxyResult = createResponse(
      statusCode,
      message,
      data,
    );

    expect(result.statusCode).toBe(statusCode);
    expect(result.body).toBe(JSON.stringify({ message }));
  });

  it('should include an error message in the response body if provided', () => {
    const statusCode = 500;
    const message = 'Error occurred';
    const data = { error: 'Something went wrong' };

    const result: APIGatewayProxyResult = createResponse(
      statusCode,
      message,
      data,
    );

    expect(result.statusCode).toBe(statusCode);
    expect(result.body).toBe(JSON.stringify({ message, ...data }));
  });
});
