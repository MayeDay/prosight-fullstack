const { PrismaClient } = require('@prisma/client');
const { DATABASE_URL } = require('./config');

module.exports = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } }
});
