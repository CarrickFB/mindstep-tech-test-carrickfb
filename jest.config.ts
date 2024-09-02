module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest', // Transform TypeScript files using ts-jest
    '^.+\\.js$': 'babel-jest', // Transform JavaScript files using babel-jest
  },
  transformIgnorePatterns: ['node_modules/(?!(flat)/)'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
};
