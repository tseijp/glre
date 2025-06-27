export default {
        rootDir: '../..',
        preset: 'ts-jest',
        /**
         * coverage config
         */
        coverageDirectory: '<rootDir>/coverage/',
        coverageReporters: ['json', 'html', 'lcov', 'text', 'text-summary', 'clover'],
        coverageThreshold: { global: { statements: 95, functions: 95, branches: 95, lines: 95 } },
        collectCoverageFrom: ['<rootDir>/packages/core/src/node/**/*.ts', '!**/index.*'],
}
