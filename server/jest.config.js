export default {
    testEnvironment: 'node',
    transform: {},
    extensionsToTreatAsEsm: [],
    testMatch: ['**/tests/**/*.test.js'],
    moduleFileExtensions: ['js', 'json'],
    clearMocks: true,
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/server.js',
        '!src/config/db.js',
    ],
};
