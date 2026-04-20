const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Next.js 앱의 경로를 지정하여 next.config.js와 .env 파일을 로드합니다.
  dir: './',
});

// 커스텀 Jest 설정
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // alias 선언
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

module.exports = createJestConfig(customJestConfig);
