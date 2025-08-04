module.exports = {
  schema: 'prisma/schema',
  seed: 'ts-node --compiler-options {\\"module\\":\\"CommonJS\\"} prisma/seed.ts'
};