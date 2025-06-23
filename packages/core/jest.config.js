export default {
        preset: 'ts-jest/presets/default-esm',
        extensionsToTreatAsEsm: ['.ts'],
        globals: {
                'ts-jest': {
                        useESM: true,
                },
        },
        moduleNameMapping: {
                '^(\\.{1,2}/.*)\\.js$': '$1',
        },
}
