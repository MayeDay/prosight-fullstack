const { PrismaClient } = require('@prisma/client');

const DATABASE_URL = process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_hf5WRqDona1S@ep-empty-feather-ams6t7mu-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

module.exports = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } }
});
