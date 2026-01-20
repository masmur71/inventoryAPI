module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/**/*.test.ts'], // Cari semua file berakhiran .test.ts
  verbose: true,
  forceExit: true, // Paksa berhenti setelah test selesai (penting untuk Mongoose/Redis)
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};