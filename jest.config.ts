import path from 'path'

const config = {
        rootDir: path.resolve(__dirname),
        roots: ['<rootDir>/'],
        preset: 'ts-jest',
        globals: { 'ts-jest': { diagnostics: true} },
        automock: false,
        clearMocks: true,
        transform: { '^.+\\.(js|jsx|ts|tsx)$': 'ts-jest' },
        testRegex: ['(/test/.*|\\.(test|spec))\\.(js|jsx|ts|tsx)$'],
        modulePaths: [],
        // moduleNameMapper: {'(.*)$': '<rootDir>/$1'},
        moduleFileExtensions: ['ts','tsx', 'js', 'jsx', 'json','node'],
        // coverage config
        coverageDirectory: '<rootDir>',
        coverageReporters: ['json', 'html', 'lcov', 'text', 'text-summary', 'clover'],
        coverageThreshold: { global: { statements: 25, functions: 25, branches: 25, lines: 25 } },
        collectCoverageFrom: [
                '<rootDir>/**/*.ts'
        ]
}

export default config