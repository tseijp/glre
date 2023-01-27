const path = require('path');

module.exports = {
        rootDir: path.join(__dirname, '../..'),
        roots: ['<rootDir>/'],
        preset: 'ts-jest',
        automock: false,
        clearMocks: true,
        transform: {'^.+\\.(js|jsx|ts|tsx)$': 'ts-jest'},
        testRegex: ['ts-jest', '(/test/.*|\\.(test|spec))\\.(js|jsx|ts|tsx)$'],
        modulePaths: [],
        // moduleNameMapper: {'(.*)$': '<rootDir>/$1'},
        moduleFileExtensions: ['ts','tsx', 'js', 'jsx', 'json','node'],

        // coverage config
        coverageDirectory: '<rootDir>/examples/cov/coverage/',
        coverageReporters: ['json', 'html', 'lcov', 'text', 'text-summary', 'clover'],
        coverageThreshold: {global: {statements: 25, functions: 25, branches: 25, lines: 25}},
        collectCoverageFrom: [ '<rootDir>/packages/**/*.ts' ],
};