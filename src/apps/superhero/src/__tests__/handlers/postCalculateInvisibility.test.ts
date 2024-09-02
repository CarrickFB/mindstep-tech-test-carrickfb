import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import axios from 'axios';
import { S3 } from 'aws-sdk';
import handler, {
  caclulateInvisibilityScore,
  getInvisibilityStatus,
} from '../../handlers/postCalculateInvisibility';
import { User } from '../../types';

jest.mock('axios');
jest.mock('aws-sdk', () => {
  const mockS3 = {
    upload: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        Location:
          'https://bucketname.s3.amazonaws.com/superhero-data-1725294673324.csv',
      }),
    }),
  };
  return { S3: jest.fn(() => mockS3) };
});

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockS3Instance = new S3() as jest.Mocked<S3>;

describe('postCalculateInvisibility handler', () => {
  const fixedTimestamp = 1725294673324; // Fixed timestamp for mocking Date.now

  beforeAll(() => {
    process.env.BUCKET_NAME = 'bucketname';
    jest.spyOn(Date, 'now').mockImplementation(() => fixedTimestamp);
  });

  afterAll(() => {
    delete process.env.BUCKET_NAME; // Clean up the environment variable after tests
  });

  it('should return 400 if superheroScore is missing', async () => {
    const event = { body: '{}' } as APIGatewayProxyEvent;
    const result: APIGatewayProxyResult = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(result.body).toContain(
      'Bad Request. superheroScore must be included in the payload.',
    );
  });

  it('should return 400 if superheroScore is out of bounds', async () => {
    const event = {
      body: JSON.stringify({ superheroScore: 150 }),
    } as APIGatewayProxyEvent;
    const result: APIGatewayProxyResult = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(result.body).toContain(
      'Bad Request. superheroScore must be a float between 0 and 100.',
    );
  });

  it('should return 500 if user fetch fails', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

    const event = {
      body: JSON.stringify({ superheroScore: 50 }),
    } as APIGatewayProxyEvent;
    const result: APIGatewayProxyResult = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(result.body).toContain('Failed to fetch user.');
  });

  it('should return 200 with invisibility score, user data, and S3 URL when successful', async () => {
    const mockUser = {
      gender: 'male',
      dob: { age: 30 },
      login: { uuid: 'test-uuid' },
    } as User;
    mockedAxios.get.mockResolvedValueOnce({ data: { results: [mockUser] } });

    const event = {
      body: JSON.stringify({ superheroScore: 80 }),
    } as APIGatewayProxyEvent;
    const result: APIGatewayProxyResult = await handler(event);

    expect(result.statusCode).toBe(200);
    const responseBody = JSON.parse(result.body);

    expect(responseBody.message).toBe(
      'Invisibility score calculated and data saved to CSV.',
    );
    expect(responseBody.csvUrl).toBe(
      'https://bucketname.s3.amazonaws.com/superhero-data-1725294673324.csv',
    );
    expect(responseBody.superheroScore).toBe(80);
    expect(responseBody.invisibilityScore).toBe(50);
    expect(responseBody.invisibilityStatus).toBe('Translucent');
    expect(responseBody.userId).toBe('test-uuid');
    expect(responseBody.userAge).toBe(30);
  });
});

describe('caclulateInvisibilityScore', () => {
  it('should correctly calculate invisibility score for male user', () => {
    const user: User = { gender: 'male', dob: { age: 30 } } as User;
    const result = caclulateInvisibilityScore(user, 50);

    expect(result).toBe(20); // 5 * (50 - 30) = 100 -> (100/500) * 100 = 20
  });

  it('should correctly calculate invisibility score for female user', () => {
    const user: User = { gender: 'female', dob: { age: 25 } } as User;
    const result = caclulateInvisibilityScore(user, 60);

    expect(result).toBe(35); // 8 * (60 - 25) = 280 -> (280/800) * 100 = 35
  });
});

describe('getInvisibilityStatus', () => {
  test.each`
    score | expected
    ${10} | ${'Not invisible'}
    ${30} | ${'Camouflage'}
    ${50} | ${'Translucent'}
    ${70} | ${'Transparent'}
    ${90} | ${'Invisible'}
  `(
    'returns "$expected" for invisibilityScore $score',
    ({ score, expected }) => {
      expect(getInvisibilityStatus(score)).toBe(expected);
    },
  );
});
