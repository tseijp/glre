export default {
        rootDir: '../..',
        preset: 'ts-jest',
        /**
         * coverage config
         */
        testEnvironment: 'jsdom',
        coverageDirectory: '<rootDir>/coverage/',
        coverageReporters: ['json', 'html', 'lcov', 'text', 'text-summary', 'clover'],
        coverageThreshold: { global: { statements: 80, functions: 80, branches: 80, lines: 80 } },
        collectCoverageFrom: ['<rootDir>/packages/core/src/node/**/*.ts', '!**/index.*'],
}
